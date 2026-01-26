/**
 * 型安全な Stack 生成用ファクトリー関数
 *
 * 各イベントタイプに応じた source/target の型チェックをコンパイル時に行う
 * 引数の型を厳密にチェックすることで、不正なStack生成を防ぐ
 */

import type { Core } from '../index';
import type { Card } from './card/Card';
import type { Unit } from './card';
import type { Player } from './Player';
import { Stack } from './stack';
import type { BreakCause, BounceLocation, DamageCause } from '@/game-data/effects/schema/types';

// =============================================================================
// 共通オプション型
// =============================================================================

interface BaseOptions {
  parent?: Stack;
}

// =============================================================================
// CardEvent 用ファクトリー関数
// =============================================================================

/** drive: ユニット召喚時のStack作成 */
export function createDriveStack(
  core: Core,
  source: Player,
  target: Unit,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'drive',
    source,
    target,
    core,
    parent: options?.parent,
  });
}

/** clockup: レベルアップ時のStack作成 */
export function createClockupStack(
  core: Core,
  source: Card,
  target: Unit,
  value: number,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'clockup',
    source,
    target,
    core,
    parent: options?.parent,
    option: { type: 'lv', value },
  });
}

/** clockdown: レベルダウン時のStack作成 */
export function createClockdownStack(
  core: Core,
  source: Card,
  target: Unit,
  value: number,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'clockdown',
    source,
    target,
    core,
    parent: options?.parent,
    option: { type: 'lv', value },
  });
}

/** overclock: オーバークロック時のStack作成 */
export function createOverclockStack(
  core: Core,
  source: Card,
  target: Unit,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'overclock',
    source,
    target,
    core,
    parent: options?.parent,
  });
}

/** attack: アタック宣言時のStack作成 */
export function createAttackStack(
  core: Core,
  source: Player,
  target: Unit,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'attack',
    source,
    target,
    core,
    parent: options?.parent,
  });
}

/** block: ブロック宣言時のStack作成 */
export function createBlockStack(
  core: Core,
  attacker: Unit,
  blocker: Unit,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'block',
    source: attacker,
    target: blocker,
    core,
    parent: options?.parent,
  });
}

/** battle: 戦闘時のStack作成 */
export function createBattleStack(
  core: Core,
  attacker: Unit,
  blocker: Unit,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'battle',
    source: attacker,
    target: blocker,
    core,
    parent: options?.parent,
  });
}

/** playerAttack: プレイヤーアタック成功時のStack作成 */
export function createPlayerAttackStack(
  core: Core,
  attacker: Unit,
  target: Player,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'playerAttack',
    source: attacker,
    target,
    core,
    parent: options?.parent,
  });
}

/** win: 戦闘勝利時のStack作成 */
export function createWinStack(
  core: Core,
  loser: Unit,
  winner: Unit,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'win',
    source: loser,
    target: winner,
    core,
    parent: options?.parent,
  });
}

/** damage: ダメージ発生時のStack作成 */
export function createDamageStack(
  core: Core,
  source: Card,
  target: Unit,
  value: number,
  cause: DamageCause,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'damage',
    source,
    target,
    core,
    parent: options?.parent,
    option: { type: 'damage', cause, value },
  });
}

/** break: 破壊時のStack作成 */
export function createBreakStack(
  core: Core,
  source: Card,
  target: Card,
  cause: BreakCause,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'break',
    source,
    target,
    core,
    parent: options?.parent,
    option: { type: 'break', cause },
  });
}

/** delete: 消滅時のStack作成 */
export function createDeleteStack(
  core: Core,
  source: Card,
  target: Card,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'delete',
    source,
    target,
    core,
    parent: options?.parent,
  });
}

/** bounce: バウンス時のStack作成 */
export function createBounceStack(
  core: Core,
  source: Card,
  target: Card,
  location: BounceLocation,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'bounce',
    source,
    target,
    core,
    parent: options?.parent,
    option: { type: 'bounce', location },
  });
}

/** handes: ハンデス時のStack作成 */
export function createHandesStack(
  core: Core,
  source: Card,
  target: Card,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'handes',
    source,
    target,
    core,
    parent: options?.parent,
  });
}

/** lost: トリガーゾーンから捨札へ移動時のStack作成 */
export function createLostStack(
  core: Core,
  source: Card,
  target: Card,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'lost',
    source,
    target,
    core,
    parent: options?.parent,
  });
}

/** move: カード移動時のStack作成 */
export function createMoveStack(
  core: Core,
  source: Card,
  target: Card,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'move',
    source,
    target,
    core,
    parent: options?.parent,
  });
}

/** extraSummon: 効果による特殊召喚時のStack作成 */
export function createExtraSummonStack(
  core: Core,
  source: Card,
  target: Unit,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'extraSummon',
    source,
    target,
    core,
    parent: options?.parent,
  });
}

/** boot: 起動効果使用時のStack作成 */
export function createBootStack(
  core: Core,
  source: Player,
  target: Unit,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'boot',
    source,
    target,
    core,
    parent: options?.parent,
  });
}

/** joker: ジョーカー発動時のStack作成 */
export function createJokerStack(
  core: Core,
  source: Player,
  target: Card,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'joker',
    source,
    target,
    core,
    parent: options?.parent,
  });
}

// =============================================================================
// CommonEvent 用ファクトリー関数
// =============================================================================

/** modifyCP: CP変更時のStack作成 */
export function createModifyCPStack(
  core: Core,
  source: Card,
  target: Player,
  value: number,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'modifyCP',
    source,
    target,
    core,
    parent: options?.parent,
    option: { type: 'cp', value },
  });
}

/** modifyPurple: 紫ゲージ変更時のStack作成 */
export function createModifyPurpleStack(
  core: Core,
  source: Card,
  target: Unit,
  value: number,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'modifyPurple',
    source,
    target,
    core,
    parent: options?.parent,
    option: { type: 'purple', value },
  });
}

/** turnStart: ターン開始時のStack作成 */
export function createTurnStartStack(core: Core, source: Player, options?: BaseOptions): Stack {
  return new Stack({
    type: 'turnStart',
    source,
    target: undefined,
    core,
    parent: options?.parent,
  });
}

/** turnEnd: ターン終了時のStack作成 */
export function createTurnEndStack(core: Core, source: Player, options?: BaseOptions): Stack {
  return new Stack({
    type: 'turnEnd',
    source,
    target: undefined,
    core,
    parent: options?.parent,
  });
}

/** intercept: インターセプト発動時のStack作成 */
export function createInterceptStack(
  core: Core,
  source: Player,
  target: Card,
  lv: number,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'intercept',
    source,
    target,
    core,
    parent: options?.parent,
    option: { type: 'lv', value: lv },
  });
}

/** trigger: トリガー発動時のStack作成 */
export function createTriggerStack(
  core: Core,
  source: Player,
  target: Card,
  lv: number,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: 'trigger',
    source,
    target,
    core,
    parent: options?.parent,
    option: { type: 'lv', value: lv },
  });
}

// =============================================================================
// InternalEvent 用ファクトリー関数
// =============================================================================

/** _postBattle: 戦闘後処理のStack作成 */
export function createPostBattleStack(
  core: Core,
  attacker: Unit,
  blocker: Unit,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: '_postBattle',
    source: attacker,
    target: blocker,
    core,
    parent: options?.parent,
  });
}

/** _postBattleClockUp: 戦闘勝利後クロックアップのStack作成 */
export function createPostBattleClockUpStack(
  core: Core,
  loser: Unit,
  winner: Unit,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: '_postBattleClockUp',
    source: loser,
    target: winner,
    core,
    parent: options?.parent,
  });
}

/** _withdraw: ユニット撤退時のStack作成 */
export function createWithdrawStack(core: Core, source: Unit, options?: BaseOptions): Stack {
  return new Stack({
    type: '_withdraw',
    source,
    target: undefined,
    core,
    parent: options?.parent,
  });
}

/** _messageReceived: メッセージ受信時のStack作成 */
export function createMessageReceivedStack(
  core: Core,
  source: Player,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: '_messageReceived',
    source,
    target: undefined,
    core,
    parent: options?.parent,
  });
}

/** _deathCounterCheckStack: 死亡カウンターチェックのStack作成 */
export function createDeathCounterCheckStack(
  core: Core,
  source: Player,
  options?: BaseOptions
): Stack {
  return new Stack({
    type: '_deathCounterCheckStack',
    source,
    target: undefined,
    core,
    parent: options?.parent,
  });
}

/** _preDrive: 召喚前処理のStack作成 */
export function createPreDriveStack(core: Core, source: Player, options?: BaseOptions): Stack {
  return new Stack({
    type: '_preDrive',
    source,
    target: undefined,
    core,
    parent: options?.parent,
  });
}
