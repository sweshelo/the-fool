import { createMessage } from '@/submodule/suit/types/message/message';
import type { Player } from '../class/Player';
import type { Core } from '../index';
import { Stack } from '../class/stack';
import { Effect } from '@/game-data/effects';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { resolveStack } from './stack-resolver';
import { setEffectDisplayHandler } from './effect-handler';
import { attack } from './battle';

/**
 * ゲーム開始
 * @param core Coreインスタンス
 */
export async function start(core: Core) {
  core.room.broadcastToPlayer(core.getTurnPlayer().id, {
    action: { type: 'operation', handler: 'client' },
    payload: { type: 'Operation', action: 'defrost' },
  });
  await turnChange(core, true);
}

/**
 * マリガン処理の実際の動作部分（カードを引きなおす）
 * @param core Coreインスタンス
 * @param player マリガンを行うプレイヤー
 */
function performMulliganAction(core: Core, player: Player): void {
  // 手札をデッキに戻す
  player.deck.push(...player.hand);
  player.hand = [];

  // デッキをシャッフル
  player.deck = EffectHelper.shuffle(player.deck);

  // 規定枚数カードを引く
  [...Array(core.room.rule.system.draw.mulligan)].forEach(() => {
    player.draw();
  });

  core.room.sync();
  core.room.soundEffect('shuffle');
  core.room.soundEffect('draw');
}

/**
 * マリガン処理 - 手札を全てデッキに戻し、デッキをシャッフルして規定枚数カードを引く
 * プレイヤーが満足するまで繰り返すことができる
 * @param core Coreインスタンス
 * @param player マリガンを行うプレイヤー
 * @returns Promise<void> プレイヤーがマリガンを終了したら解決される
 */
export async function mulligan(core: Core, player: Player): Promise<void> {
  // 初回はカードを引く
  if (player.hand.length === 0) {
    [...Array(core.room.rule.system.draw.mulligan)].forEach(() => {
      player.draw();
    });
    core.room.sync();
  }

  // マリガンループ
  return new Promise<void>(resolve => {
    const processMulligan = () => {
      // 毎回ユニークなプロンプトIDを生成（player.id を含めることで検索可能にする）
      const promptId = `${core.id}_mulligan_${player.id}_${crypto.randomUUID()}`;

      // マリガンの開始を通知
      core.room.broadcastToPlayer(
        player.id,
        createMessage({
          action: {
            type: 'MulliganStart',
            handler: 'client',
          },
          payload: {
            type: 'MulliganStart',
          },
        })
      );

      // プレイヤーの選択を待つ
      setEffectDisplayHandler(core, promptId, (choice: string[] | undefined) => {
        const action = choice?.[0];

        if (action === 'retry') {
          // マリガン処理を実行
          performMulliganAction(core, player);
          // 次のマリガン判断へ
          processMulligan();
        } else {
          // マリガン終了
          resolve();
        }
      });
    };

    // マリガン処理を開始
    processMulligan();
  });
}

/**
 * ターンチェンジ
 * @param core Coreインスタンス
 * @param isFirstTurn 初回ターンかどうか
 */
export async function turnChange(core: Core, isFirstTurn: boolean = false) {
  // freeze
  core.room.broadcastToAll({
    action: { type: 'operation', handler: 'client' },
    payload: { type: 'Operation', action: 'freeze' },
  });

  if (!isFirstTurn) {
    // ターン終了スタックを積み、解決する
    core.stack.push(
      new Stack({
        type: 'turnEnd',
        source: core.getTurnPlayer(),
        core: core,
      })
    );
    await resolveStack(core);

    // ターン終了処理
    const deathCounterCheckStack = new Stack({
      type: '_deathCounterCheckStack',
      source: core.getTurnPlayer(),
      core: core,
    });
    core.getTurnPlayer().field.forEach(unit => {
      if (unit.hasKeyword('不屈') && !unit.active) {
        unit.active = true;
        core.room.soundEffect('reboot');
      }
      if (unit.delta.some(delta => delta.effect.type === 'death' && delta.count <= 0)) {
        Effect.break(deathCounterCheckStack, unit, unit, 'death');
      }
    });
    core.stack.push(deathCounterCheckStack);
    await resolveStack(core);

    // ウィルス除外
    const afterField = core
      .getTurnPlayer()
      .field.filter(
        unit => !unit.delta.some(delta => delta.effect.type === 'life' && delta.count <= 0)
      );
    if (afterField.length !== core.getTurnPlayer().field.length) {
      core.getTurnPlayer().field = afterField;
      core.room.soundEffect('leave');
    }

    core.getTurnPlayer().joker.gauge = Math.min(core.getTurnPlayer().joker.gauge + 10, 100);
    core.room.sync();

    // ターン開始処理
    core.turn++;
    core.round = Math.floor((core.turn + 1) / 2);
  } else {
    await Promise.all(core.players.map(player => mulligan(core, player)));
  }

  // CP初期化
  const turnPlayer = core.getTurnPlayer();
  if (turnPlayer) {
    console.log(
      `[turnChange] Room: %s | ROUND: %s / Turn: %s`,
      core.room.id,
      core.round,
      core.turn
    );

    core.room.broadcastToAll(
      createMessage({
        action: {
          handler: 'client',
          type: 'visual',
        },
        payload: {
          type: 'TurnChange',
          player: turnPlayer.id,
          isFirst: (core.turn - 1 + core.firstPlayerIndex) % 2 === 0,
        },
      })
    );
    await new Promise(resolve => setTimeout(resolve, 2000));

    const max =
      core.room.rule.system.cp.init +
      core.room.rule.system.cp.increase * (core.round - 1) +
      (core.room.rule.system.handicap.cp && core.round === 1 && core.turn === 2 ? 1 : 0);

    turnPlayer.cp = {
      current: Math.min(
        max + (core.room.rule.system.cp.carryover ? turnPlayer.cp.current : 0),
        core.room.rule.system.cp.ceil,
        core.room.rule.system.cp.max
      ),
      max: Math.min(max, core.room.rule.system.cp.ceil, core.room.rule.system.cp.max),
    };
    core.room.soundEffect('cp-increase');

    // ドロー
    if (!(core.turn === 1 && core.room.rule.system.handicap.draw)) {
      [...Array(core.room.rule.system.draw.top)].forEach(() => {
        if (turnPlayer.hand.length < core.room.rule.player.max.hand) turnPlayer.draw();
      });
      core.room.soundEffect('draw');
    }

    turnPlayer.field.forEach(unit => {
      if (!unit.hasKeyword('呪縛') && !unit.active) {
        unit.active = true;
        core.room.soundEffect('reboot');
      }
      unit.isBooted = false;
    });
  }

  // 行動制限を解除する
  core
    .getTurnPlayer()
    .field.forEach(
      unit =>
        (unit.delta = unit.delta.filter(
          delta => !(delta.effect.type === 'keyword' && delta.effect.name === '行動制限')
        ))
    );

  core.room.sync();

  // ターン開始スタックを積み、解決する
  core.histories = [];
  core.stack.push(
    new Stack({
      type: 'turnStart',
      source: core.getTurnPlayer(),
      core: core,
    })
  );
  await resolveStack(core);

  // 狂戦士 アタックさせる
  for (const unit of core
    .getTurnPlayer()
    .field.filter(
      unit =>
        unit.hasKeyword('狂戦士') &&
        !unit.hasKeyword('攻撃禁止') &&
        !unit.hasKeyword('行動制限') &&
        unit.active
    )) {
    await attack(core, unit);
  }

  // defrost
  core.room.broadcastToPlayer(core.getTurnPlayer().id, {
    action: { type: 'operation', handler: 'client' },
    payload: { type: 'Operation', action: 'defrost' },
  });
}
