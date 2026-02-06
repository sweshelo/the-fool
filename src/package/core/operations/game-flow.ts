import { createMessage } from '@/submodule/suit/types/message/message';
import type { Player } from '../class/Player';
import type { Core } from '../index';
import { Stack } from '../class/stack';
import { Effect } from '@/game-data/effects';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { resolveStack } from './stack-resolver';
import { setEffectDisplayHandler } from './effect-handler';
import { attack } from './battle';
import { MessageHelper } from '../helpers/message';
import type { SituationCompletedPayload } from '@/submodule/suit/types';
import type { MatchEndReason } from '@/package/logging/types';
import { debug, info } from '@/package/console-logger';

/**
 * ゲーム終了処理を統一的に行う
 * - SituationCompleted をブロードキャスト
 * - Supabase にマッチ終了をログ
 */
export async function completeGame(
  core: Core,
  winnerId: string | undefined,
  reason: 'damage' | 'limit' | 'surrender'
): Promise<void> {
  // 1. SituationCompleted をブロードキャスト
  core.room.broadcastToAll(
    createMessage({
      action: {
        type: 'situation',
        handler: 'client',
      },
      payload: {
        type: 'SituationCompleted',
        winner: winnerId,
        reason: reason,
      } satisfies SituationCompletedPayload,
    })
  );

  // 2. winnerIndex を算出（0 or 1, or null if draw）
  const winnerIndex = winnerId ? core.players.findIndex(p => p.id === winnerId) : null;
  const validWinnerIndex = winnerIndex === -1 ? null : winnerIndex;

  // 3. MatchEndReason へマッピング
  const endReason: MatchEndReason =
    reason === 'damage' ? 'life_zero' : reason === 'surrender' ? 'surrender' : 'round_limit';

  // 4. ゲーム終了ログ
  info(
    'Matching',
    'Game ended: room=%s, winner=%s, reason=%s',
    core.room.id,
    winnerId ?? 'draw',
    reason
  );

  // 5. Supabase にログ記録
  await core.room.logger.logMatchEnd(core, validWinnerIndex, endReason);
}

/**
 * ゲーム開始
 * @param core Coreインスタンス
 */
export async function start(core: Core) {
  core.room.broadcastToAll(MessageHelper.defrost());
  await turnChange(core, { isFirstTurn: true });
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
export async function turnChange(
  core: Core,
  option: {
    isFirstTurn?: boolean;
    time?: number;
  } = {}
) {
  // freeze
  core.room.broadcastToAll(MessageHelper.freeze());

  if (!option?.isFirstTurn) {
    // ジョーカーゲージ増加量を確定
    const { minTurnEnd, maxTurnEnd } = core.room.rule.joker;
    const timeRatio =
      Math.max(Math.min(option.time ?? 0, core.room.rule.system.turnTime), 0) /
      core.room.rule.system.turnTime;
    const jokerGauge = minTurnEnd + (maxTurnEnd - minTurnEnd) * timeRatio;
    core.getTurnPlayer().joker.gauge = Math.min(core.getTurnPlayer().joker.gauge + jokerGauge, 100);

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

    core.room.sync();

    // ゲームの終了をチェック
    if (core.round * 2 === core.turn && core.round === core.room.rule.system.round) {
      // ライフの多いプレイヤーを取得する（降順ソート）
      const [winner, loser] = core.players.sort((a, b) => b.life.current - a.life.current);
      const winnerId =
        winner?.life.current === loser?.life.current ? core.getTurnPlayer().id : winner?.id;

      await completeGame(core, winnerId, 'limit');
      return;
    }

    // ターン開始処理
    core.turn++;
    core.round = Math.floor((core.turn + 1) / 2);
  } else {
    await Promise.all(core.players.map(player => mulligan(core, player)));
    core.turn = 1;
    core.round = 1;
  }

  // CP初期化
  const turnPlayer = core.getTurnPlayer();
  if (turnPlayer) {
    debug(
      'Core',
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
          isFirst: (core.turn - 1 + core.firstPlayerIndex) % 2 === core.firstPlayerIndex,
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

  // inHand設定: ゲージ条件を満たしたJokerを手札に移動（初回ターン=マリガン前は除く）
  core.getTurnPlayer().checkAndMoveJokerToHand();
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
  core.room.broadcastToAll(MessageHelper.defrost());
}
