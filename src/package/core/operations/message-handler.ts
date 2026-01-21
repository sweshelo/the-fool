import { createMessage, type Message } from '@/submodule/suit/types/message/message';
import type {
  DebugDrawPayload,
  IAtom,
  OverridePayload,
  UnitDrivePayload,
  ChoosePayload,
  WithdrawalPayload,
  ContinuePayload,
  TriggerSetPayload,
  EvolveDrivePayload,
  JokerDrivePayload,
  DebugMakePayload,
  DebugDrivePayload,
  AttackPayload,
  BootPayload,
} from '@/submodule/suit/types';
import type { Core } from '../index';
import catalog from '@/game-data/catalog';
import { Stack } from '../class/stack';
import { Evolve, Unit } from '../class/card';
import { Intercept } from '../class/card/Intercept';
import { Trigger } from '../class/card/Trigger';
import { JOKER_GAUGE_AMOUNT } from '@/submodule/suit/constant/joker';
import { handleEffectResponse, handleContinue } from './effect-handler';
import { turnChange } from './game-flow';
import { attack } from './battle';
import { drive, fieldEffectUnmount } from './card-operations';
import { resolveStack } from './stack-resolver';
import { MessageHelper } from '../helpers/message';

/**
 * クライアントからのメッセージを処理する
 * @param core Coreインスタンス
 * @param message メッセージ
 */
export async function handleMessage(core: Core, message: Message) {
  console.log(
    '[handleMessage] action: %s | payload: %s',
    message.action.type,
    message.payload.type
  );
  switch (message.payload.type) {
    case 'Choose': {
      const payload: ChoosePayload = message.payload;
      handleEffectResponse(core, payload.promptId, payload.choice);
      return; // Stackを生成させない
    }
    case 'Continue': {
      const payload: ContinuePayload = message.payload;
      handleContinue(core, payload.promptId);
      return; // Stackを生成させない
    }
    case 'Override': {
      const payload: OverridePayload = message.payload;
      // オーバーライド要件を満たしているかチェックする
      const player = core.players.find(p => p.id === payload.player);
      const parent = player?.find({ ...payload.parent } satisfies IAtom);
      const target = player?.find({ ...payload.target } satisfies IAtom);

      if (!parent?.card || !target?.card || !player) return;

      // 2つのカードがどちらも手札の中にある
      const isOnHand = parent.place?.name === 'hand' && target?.place?.name === 'hand';

      // 2つのカードが同じである
      const isSameCard = core.room.rule.misc.strictOverride
        ? catalog.get(parent.card.catalogId)?.id === catalog.get(target.card.catalogId)?.id
        : catalog.get(parent.card.catalogId)?.name === catalog.get(target.card.catalogId)?.name;

      // 受け皿がLv3未満
      const isUnderLv3 = parent?.card?.lv < 3;

      if (isOnHand && isSameCard && isUnderLv3) {
        player.hand = player?.hand.filter(card => card.id !== target.card?.id);
        parent.card.lv++;

        target.card.reset();
        player.trash.push(target.card);
        [...Array(core.room.rule.system.draw.override)].forEach(() => {
          if (player.hand.length < core.room.rule.player.max.hand) {
            player.draw();
          }
        });
        core.room.sync();
        core.room.soundEffect('draw');
        core.room.soundEffect('clock-up');
        core.room.soundEffect('trash');
      }
      break;
    }
    case 'EvolveDrive':
    case 'UnitDrive': {
      const payload: UnitDrivePayload | EvolveDrivePayload = message.payload;
      const remainingTime = payload.remainingTime;
      core.room.broadcastToAll(MessageHelper.freeze(remainingTime));
      const player = core.players.find(p => p.id === payload.player);
      const { card } = player?.find({ ...payload.target } satisfies IAtom) ?? {};
      if (!card || !player) {
        console.log(payload);
        throw new Error('指定されたCardかPlayerのどちらかが不正でした');
      }

      const cardCatalog = catalog.get(card.catalogId);
      if (!cardCatalog) throw new Error('カタログに存在しないカードが指定されました');

      // Bannedチェック
      if (card.delta.some(delta => delta.effect.type === 'banned')) return;

      // CPが足りている
      // 軽減チェック
      const mitigate = player.trigger.find(
        c =>
          c.catalog.color === card.catalog.color &&
          (c.catalog.type === 'advanced_unit' || c.catalog.type === 'unit')
      );
      const isEnoughCP =
        cardCatalog.cost -
          (mitigate ? 1 : 0) +
          card.delta
            .map(delta => (delta.effect.type === 'cost' ? delta.effect.value : 0))
            .reduce((acc, cur) => acc + cur, 0) <=
        player.cp.current;

      // ユニットである
      const isUnit = card instanceof Unit;

      // 進化?
      const isEvolve = message.payload.type === 'EvolveDrive' && 'source' in payload;

      // フィールドのユニット数が規定未満
      const hasFieldSpace = isEvolve ? true : player.field.length < core.room.rule.player.max.field;

      const source = isEvolve
        ? player.field.find(unit => unit.id === payload.source.id)
        : undefined;
      if (isEvolve) {
        const notEvolvable =
          source?.catalog.species?.includes('ウィルス') || source?.hasKeyword('進化禁止');

        if (notEvolvable) {
          console.error('進化できないユニットが進化元に指定されました');
          return;
        }

        if (!source) {
          console.error('進化ユニットが召喚されようとしましたが source が不正でした');
          return;
        }
      }

      if (isEnoughCP && hasFieldSpace && isUnit) {
        const cost =
          card.catalog.cost +
          card.delta
            .map(delta => (delta.effect.type === 'cost' ? delta.effect.value : 0))
            .reduce((acc, cur) => acc + cur, 0);

        // オリジナルのcostが0でない場合はmitigateをtriggerからtrashに移動させる
        if (cost > 0 && mitigate) {
          player.trigger = player.trigger.filter(c => c.id !== mitigate.id);
          mitigate.lv = 1;
          player.trash.push(mitigate);
        }

        const actualCost = cost - (mitigate ? 1 : 0);
        player.cp.current -= Math.min(Math.max(actualCost, 0), player.cp.current);
        if (actualCost > 0) core.room.soundEffect('cp-consume');
        player.hand = player?.hand.filter(c => c.id !== card?.id);

        await drive(core, player, card, source);
      }

      core.room.broadcastToAll(MessageHelper.defrost(remainingTime));
      break;
    }

    case 'JokerDrive': {
      const payload: JokerDrivePayload = message.payload;
      const remainingTime = payload.remainingTime;
      core.room.broadcastToAll(MessageHelper.freeze(remainingTime));

      // Validate player
      const player = core.players.find(p => p.id === payload.player);
      if (!player) {
        throw new Error('Invalid player');
      }

      // Find joker ability in player's jokers using IAtom (id + catalogId)
      const joker = player.joker.card.find(j => j.id === payload.target.id);

      if (!joker || joker.catalog.type !== 'joker') {
        throw new Error('Invalid joker ability');
      }

      // Check if player has enough gauge
      if (!joker.catalog.gauge || player.joker.gauge < JOKER_GAUGE_AMOUNT[joker.catalog.gauge]) {
        throw new Error('Insufficient joker gauge');
      }

      // check if player has enough cp
      const cost = joker.catalog.cost;
      if (player.cp.current < cost) {
        throw new Error('Insufficient cp');
      }

      // Check conditions (checkJoker)
      const canActivate = joker.catalog.checkJoker?.(player, core) ?? false;

      if (!canActivate) {
        throw new Error('Joker conditions not met');
      }

      // Consume gauge
      if (!joker.catalog.gauge) {
        throw new Error('ジョーカーゲージの消費量が定義されていません');
      }

      player.joker.gauge -= JOKER_GAUGE_AMOUNT[joker.catalog.gauge];

      if (joker.catalog.cost > 0) {
        player.cp.current -= joker.catalog.cost;
        core.room.soundEffect('cp-consume');
      }
      core.room.soundEffect('evolve');
      core.room.sync();

      core.room.broadcastToAll(
        createMessage({
          action: {
            type: 'effect',
            handler: 'client',
          },
          payload: {
            type: 'VisualEffect',
            body: {
              effect: 'drive',
              image: `https://coj.sega.jp/player/img/${joker.catalog.img}`,
              player: player.id,
              type: 'JOKER',
            },
          },
        })
      );

      // Create and resolve joker stack
      core.histories.push({
        card: joker,
        action: 'joker',
        generation: joker.generation,
      });
      const jokerStack = new Stack({
        type: 'joker',
        source: player,
        target: joker,
        core: core,
      });

      // Stack解決（resolveStack が自動で onJokerSelf を呼ぶ）
      core.stack.push(jokerStack);
      await resolveStack(core);
      core.room.broadcastToAll(MessageHelper.defrost(remainingTime));
      break;
    }

    case 'Withdrawal': {
      const payload: WithdrawalPayload = message.payload;
      const player = core.players.find(p => p.id === payload.player);
      const target = player?.field.find(unit => unit.id === payload.target.id);

      if (target?.hasKeyword('撤退禁止') || target?.catalog.species?.includes('ウィルス'))
        throw new Error('撤退できないユニットが指定されました');

      if (target && player) {
        player.field = player.field.filter(u => u.id !== target.id);
        player.trash.push(target);
        target.reset();

        // フィールド効果呼び出し
        const stack = new Stack({
          type: '_withdraw',
          core: core,
          source: target,
        });
        fieldEffectUnmount(core, target, stack);

        core.room.soundEffect('withdrawal');
        core.room.sync();

        core.stack.push(stack);
        await resolveStack(core);
      }
      break;
    }

    case 'TriggerSet': {
      const payload: TriggerSetPayload = message.payload;
      const player = core.players.find(p => p.id === payload.player);
      const target = player?.find(payload.target);
      const isOnHand = target?.place?.name === 'hand';
      const isEnoughTriggerZone = (player?.trigger.length ?? 0) < core.room.rule.player.max.trigger;

      if (target && target.card && player && isEnoughTriggerZone && isOnHand) {
        player.hand = player.hand.filter(c => c.id !== target.card?.id);
        player.trigger.push(target.card);
        core.room.sync();
        core.room.soundEffect('trigger');
      }
      break;
    }

    case 'TurnEnd': {
      await turnChange(core);
      break;
    }

    case 'Attack': {
      const payload: AttackPayload = message.payload;
      const remainingTime = payload.remainingTime;
      core.room.broadcastToAll(MessageHelper.freeze(remainingTime));

      // IUnit -> Unitに変換
      const attacker = core.players
        .find(player => player.id === payload.player)
        ?.field.find(unit => unit.id === payload.target.id);
      if (!attacker) throw new Error('存在しないユニットがアタッカーとして指定されました');

      await attack(core, attacker);
      core.room.broadcastToAll(MessageHelper.defrost(remainingTime));
      break;
    }

    case 'Boot': {
      const payload: BootPayload = message.payload;
      const remainingTime = payload.remainingTime;
      core.room.broadcastToAll(MessageHelper.freeze(remainingTime));
      const player = core.players.find(p => p.id === payload.player);
      const target = player?.field.find(unit => unit.id === payload.target.id);

      if (
        !player ||
        !target ||
        !target.catalog.isBootable ||
        typeof target.catalog.isBootable !== 'function' ||
        target.isBooted
      )
        return;
      if (
        target.catalog.isBootable(core, target) &&
        !core.histories.some(
          history =>
            history.action === 'boot' &&
            history.card.id === target.id &&
            history.generation === target.generation
        )
      ) {
        core.histories.push({
          card: target,
          action: 'boot',
          generation: target.generation,
        });
        target.isBooted = true;
        core.room.soundEffect('recover');
        await new Promise(resolve => setTimeout(resolve, 900));
        core.stack.push(new Stack({ type: 'boot', target, core: core, source: player }));
        await resolveStack(core);
      }
      core.room.broadcastToAll(MessageHelper.defrost(remainingTime));
      break;
    }

    case 'Discard': {
      const payload = message.payload;
      const player = core.players.find(p => p.id === payload.player);
      const target = player?.find(payload.target);
      const isOnHand = target?.place?.name === 'hand';

      if (target && target.card && player && isOnHand) {
        player.hand = player.hand.filter(c => c.id !== target.card?.id);
        player.trash.push(target.card);
        target.card.reset();
        core.room.sync();
        core.room.soundEffect('trash');
      }
      break;
    }

    case 'Mulligan': {
      const payload = message.payload;
      // Core インスタンス固有の effectResponses から mulligan ハンドラを検索
      // promptId の形式: ${core.id}_mulligan_${player.id}_${uuid}
      const mulliganPromptId = Array.from(core.effectResponses.keys()).find(id =>
        id.startsWith(`${core.id}_mulligan_${payload.player}_`)
      );

      if (mulliganPromptId) {
        handleEffectResponse(core, mulliganPromptId, [payload.action]);
      } else {
        console.warn(`[Core ${core.id}] No mulligan handler found for player ${payload.player}`);
      }
      break;
    }

    case 'DebugDraw': {
      const payload: DebugDrawPayload = message.payload;
      const target = core.players.find(player => player.id === payload.player);
      if (target) {
        target.draw();
        core.room.sync();
      }
      break;
    }
    case 'DebugMake': {
      const payload: DebugMakePayload = message.payload;
      const target = core.players.find(player => player.id === payload.player);
      const master = catalog.get(payload.catalogId);
      if (target && master) {
        switch (master.type) {
          case 'unit':
            target.hand.push(new Unit(target, master.id));
            break;
          case 'advanced_unit':
            target.hand.push(new Evolve(target, master.id));
            break;
          case 'intercept':
            target.hand.push(new Intercept(target, master.id));
            break;
          case 'trigger':
            target.hand.push(new Trigger(target, master.id));
            break;
        }
        break;
      }
      break;
    }
    case 'DebugDrive': {
      const payload: DebugDrivePayload = message.payload;
      const target = core.players.find(player => player.id === payload.player);
      const master = catalog.get(payload.catalogId);
      if (target && master) {
        switch (master.type) {
          case 'unit':
            await drive(core, target, new Unit(target, master.id));
            break;
          default:
            throw new Error('召喚できないカードが指定されました');
        }
      }
      break;
    }
  }

  core.stack.push(
    new Stack({ type: '_messageReceived', source: core.getTurnPlayer(), core: core })
  );
  await resolveStack(core);
}
