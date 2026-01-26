import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card/Card';
import type { Unit } from '@/package/core/class/card';
import type { Core } from '@/package/core';
import type { Player } from '@/package/core/class/Player';
import type {
  EventCheckHandlers,
  EventOnHandlers,
  EventOnHandlersWithTargetSuffix,
  EventOnHandlersWithEventSuffix,
  HANDLER_SUFFIXES_TARGET,
  HANDLER_SUFFIXES_EVENT,
} from './handlers';

// =============================================================================
// 基本の StackWithCard 型
// =============================================================================

/**
 * A Stack with a guaranteed Card in the processing property
 * Used for card effect methods where we can guarantee processing is a Card
 */
export type StackWithCard<T extends Card = Card> = Stack & { processing: T };

// =============================================================================
// ハンドラー関数の型定義（後方互換性のため維持）
// =============================================================================

/**
 * Type for card effect methods starting with "on"
 * These methods return Promise<void>
 */
export type OnEffectMethod =
  | ((stack: StackWithCard<Unit>) => Promise<void>)
  | ((stack: StackWithCard<Card>) => Promise<void>);

/**
 * Type for card effect methods starting with "check"
 * These methods return Promise<boolean>
 */
export type CheckEffectMethod = (stack: StackWithCard<Card>) => Promise<boolean> | boolean;

/**
 * Type for checkJoker method
 * Takes player and core directly instead of stack for efficiency
 */
export type CheckJokerMethod = (player: Player, core: Core) => boolean;

// 全てのサフィックス付きハンドラーを展開
type AllSuffixHandlers = Partial<
  EventOnHandlersWithTargetSuffix<OnEffectMethod, (typeof HANDLER_SUFFIXES_TARGET)[number]> &
    EventOnHandlersWithEventSuffix<OnEffectMethod, (typeof HANDLER_SUFFIXES_EVENT)[number]>
>;

// =============================================================================
// CardEffects インターフェース（後方互換性のため維持）
// =============================================================================

/**
 * Interface for the effects object exported by card effect files
 * Defines the structure and types for card effect methods
 */
export interface CardEffects
  extends
    Omit<Partial<EventCheckHandlers<CheckEffectMethod>>, 'checkJoker'>,
    Partial<EventOnHandlers<OnEffectMethod>>,
    AllSuffixHandlers {
  fieldEffect?: (stack: StackWithCard<Unit>) => void;
  isBootable?: (core: Core, self: Unit) => boolean;
  handEffect?: ((core: Core, self: Card) => void) | ((core: Core, self: Unit) => void);
  checkJoker?: CheckJokerMethod;
}

// =============================================================================
// イベント別の型付き Stack 型（新規実装用）
// =============================================================================

/**
 * processing が Card であることを保証し、イベント固有のsource/target型を持つStack
 */
type TypedStackBase<
  TType extends string,
  TSource,
  TTarget,
  TOption = undefined,
> = StackWithCard<Card> & {
  type: TType;
  source: TSource;
  target: TTarget;
  option: TOption extends undefined ? Stack['option'] : TOption;
};

// -----------------------------------------------------------------------------
// StackOption 型定義
// -----------------------------------------------------------------------------

export type BreakCause = 'effect' | 'battle' | 'damage' | 'death' | 'system';
export type BounceLocation = 'hand' | 'deck' | 'trigger';
export type DamageCause = 'effect' | 'battle';

export type BreakOption = {
  type: 'break';
  cause: BreakCause;
};

export type BounceOption = {
  type: 'bounce';
  location: BounceLocation;
};

export type DamageOption = {
  type: 'damage';
  cause: DamageCause;
  value: number;
};

export type CpOption = {
  type: 'cp';
  value: number;
};

export type LvOption = {
  type: 'lv';
  value: number;
};

export type PurpleOption = {
  type: 'purple';
  value: number;
};

export type StackOption =
  | BreakOption
  | BounceOption
  | DamageOption
  | CpOption
  | LvOption
  | PurpleOption;

// -----------------------------------------------------------------------------
// CardEvent 用の型付きStack
// -----------------------------------------------------------------------------

/** drive: ユニット召喚時 */
export type DriveStack = TypedStackBase<'drive', Player, Unit>;

/** clockup: レベルアップ時 */
export type ClockupStack = TypedStackBase<'clockup', Card, Unit, LvOption>;

/** clockdown: レベルダウン時 */
export type ClockdownStack = TypedStackBase<'clockdown', Card, Unit, LvOption>;

/** overclock: オーバークロック時 */
export type OverclockStack = TypedStackBase<'overclock', Card, Unit>;

/** attack: アタック宣言時 */
export type AttackStack = TypedStackBase<'attack', Player, Unit>;

/** block: ブロック宣言時 */
export type BlockStack = TypedStackBase<'block', Unit, Unit>;

/** battle: 戦闘時 */
export type BattleStack = TypedStackBase<'battle', Unit, Unit>;

/** playerAttack: プレイヤーアタック成功時 */
export type PlayerAttackStack = TypedStackBase<'playerAttack', Unit, Player>;

/** win: 戦闘勝利時 */
export type WinStack = TypedStackBase<'win', Unit, Unit>;

/** damage: ダメージ発生時 */
export type DamageStack = TypedStackBase<'damage', Card, Unit, DamageOption>;

/** break: 破壊時 */
export type BreakStack = TypedStackBase<'break', Card, Card, BreakOption>;

/** delete: 消滅時 */
export type DeleteStack = TypedStackBase<'delete', Card, Card>;

/** bounce: バウンス時 */
export type BounceStack = TypedStackBase<'bounce', Card, Card, BounceOption>;

/** handes: ハンデス時 */
export type HandesStack = TypedStackBase<'handes', Card, Card>;

/** lost: トリガーゾーンから捨札へ移動時 */
export type LostStack = TypedStackBase<'lost', Card, Card>;

/** move: カード移動時 */
export type MoveStack = TypedStackBase<'move', Card, Card>;

/** extraSummon: 効果による特殊召喚時 */
export type ExtraSummonStack = TypedStackBase<'extraSummon', Card, Unit>;

/** boot: 起動効果使用時 */
export type BootStack = TypedStackBase<'boot', Player, Unit>;

/** joker: ジョーカー発動時 */
export type JokerStack = TypedStackBase<'joker', Player, Card>;

// -----------------------------------------------------------------------------
// CommonEvent 用の型付きStack
// -----------------------------------------------------------------------------

/** modifyCP: CP変更時 */
export type ModifyCPStack = TypedStackBase<'modifyCP', Card, Player, CpOption>;

/** modifyPurple: 紫ゲージ変更時 */
export type ModifyPurpleStack = TypedStackBase<'modifyPurple', Card, Unit, PurpleOption>;

/** turnStart: ターン開始時 */
export type TurnStartStack = TypedStackBase<'turnStart', Player, undefined>;

/** turnEnd: ターン終了時 */
export type TurnEndStack = TypedStackBase<'turnEnd', Player, undefined>;

/** intercept: インターセプト発動時 */
export type InterceptStack = TypedStackBase<'intercept', Player, Card, LvOption>;

/** trigger: トリガー発動時 */
export type TriggerStack = TypedStackBase<'trigger', Player, Card, LvOption>;

// -----------------------------------------------------------------------------
// InternalEvent 用の型付きStack
// -----------------------------------------------------------------------------

/** _postBattle: 戦闘後処理 */
export type PostBattleStack = TypedStackBase<'_postBattle', Unit, Unit>;

/** _postBattleClockUp: 戦闘勝利後クロックアップ */
export type PostBattleClockUpStack = TypedStackBase<'_postBattleClockUp', Unit, Unit>;

/** _withdraw: ユニット撤退時 */
export type WithdrawStack = TypedStackBase<'_withdraw', Unit, undefined>;

/** _messageReceived: メッセージ受信時 */
export type MessageReceivedStack = TypedStackBase<'_messageReceived', Player, undefined>;

/** _deathCounterCheckStack: 死亡カウンターチェック */
export type DeathCounterCheckStack = TypedStackBase<'_deathCounterCheckStack', Player, undefined>;

/** _preDrive: 召喚前処理 */
export type PreDriveStack = TypedStackBase<'_preDrive', Player, undefined>;

// =============================================================================
// イベント別の型付きハンドラー型（新規実装用）
// =============================================================================

// CardEvent ハンドラー型
export type CheckDriveHandler = (stack: DriveStack) => boolean | Promise<boolean>;
export type OnDriveHandler = (stack: DriveStack) => Promise<void>;

export type CheckClockupHandler = (stack: ClockupStack) => boolean | Promise<boolean>;
export type OnClockupHandler = (stack: ClockupStack) => Promise<void>;

export type CheckClockdownHandler = (stack: ClockdownStack) => boolean | Promise<boolean>;
export type OnClockdownHandler = (stack: ClockdownStack) => Promise<void>;

export type CheckOverclockHandler = (stack: OverclockStack) => boolean | Promise<boolean>;
export type OnOverclockHandler = (stack: OverclockStack) => Promise<void>;

export type CheckAttackHandler = (stack: AttackStack) => boolean | Promise<boolean>;
export type OnAttackHandler = (stack: AttackStack) => Promise<void>;

export type CheckBlockHandler = (stack: BlockStack) => boolean | Promise<boolean>;
export type OnBlockHandler = (stack: BlockStack) => Promise<void>;

export type CheckBattleHandler = (stack: BattleStack) => boolean | Promise<boolean>;
export type OnBattleHandler = (stack: BattleStack) => Promise<void>;

export type CheckPlayerAttackHandler = (stack: PlayerAttackStack) => boolean | Promise<boolean>;
export type OnPlayerAttackHandler = (stack: PlayerAttackStack) => Promise<void>;

export type CheckWinHandler = (stack: WinStack) => boolean | Promise<boolean>;
export type OnWinHandler = (stack: WinStack) => Promise<void>;

export type CheckDamageHandler = (stack: DamageStack) => boolean | Promise<boolean>;
export type OnDamageHandler = (stack: DamageStack) => Promise<void>;

export type CheckBreakHandler = (stack: BreakStack) => boolean | Promise<boolean>;
export type OnBreakHandler = (stack: BreakStack) => Promise<void>;

export type CheckDeleteHandler = (stack: DeleteStack) => boolean | Promise<boolean>;
export type OnDeleteHandler = (stack: DeleteStack) => Promise<void>;

export type CheckBounceHandler = (stack: BounceStack) => boolean | Promise<boolean>;
export type OnBounceHandler = (stack: BounceStack) => Promise<void>;

export type CheckHandesHandler = (stack: HandesStack) => boolean | Promise<boolean>;
export type OnHandesHandler = (stack: HandesStack) => Promise<void>;

export type CheckLostHandler = (stack: LostStack) => boolean | Promise<boolean>;
export type OnLostHandler = (stack: LostStack) => Promise<void>;

export type CheckMoveHandler = (stack: MoveStack) => boolean | Promise<boolean>;
export type OnMoveHandler = (stack: MoveStack) => Promise<void>;

export type CheckExtraSummonHandler = (stack: ExtraSummonStack) => boolean | Promise<boolean>;
export type OnExtraSummonHandler = (stack: ExtraSummonStack) => Promise<void>;

export type CheckBootHandler = (stack: BootStack) => boolean | Promise<boolean>;
export type OnBootHandler = (stack: BootStack) => Promise<void>;

export type CheckJokerHandler = (stack: JokerStack) => boolean | Promise<boolean>;
export type OnJokerHandler = (stack: JokerStack) => Promise<void>;

// CommonEvent ハンドラー型
export type CheckModifyCPHandler = (stack: ModifyCPStack) => boolean | Promise<boolean>;
export type OnModifyCPHandler = (stack: ModifyCPStack) => Promise<void>;

export type CheckModifyPurpleHandler = (stack: ModifyPurpleStack) => boolean | Promise<boolean>;
export type OnModifyPurpleHandler = (stack: ModifyPurpleStack) => Promise<void>;

export type CheckTurnStartHandler = (stack: TurnStartStack) => boolean | Promise<boolean>;
export type OnTurnStartHandler = (stack: TurnStartStack) => Promise<void>;

export type CheckTurnEndHandler = (stack: TurnEndStack) => boolean | Promise<boolean>;
export type OnTurnEndHandler = (stack: TurnEndStack) => Promise<void>;

export type CheckInterceptHandler = (stack: InterceptStack) => boolean | Promise<boolean>;
export type OnInterceptHandler = (stack: InterceptStack) => Promise<void>;

export type CheckTriggerHandler = (stack: TriggerStack) => boolean | Promise<boolean>;
export type OnTriggerHandler = (stack: TriggerStack) => Promise<void>;

// =============================================================================
// 型ガード
// =============================================================================

/**
 * StackがDriveStackかどうかを判定する型ガード
 */
export function isDriveStack(stack: Stack): stack is DriveStack {
  return stack.type === 'drive';
}

/**
 * StackがBattleStackかどうかを判定する型ガード
 */
export function isBattleStack(stack: Stack): stack is BattleStack {
  return stack.type === 'battle';
}

/**
 * StackがPlayerAttackStackかどうかを判定する型ガード
 */
export function isPlayerAttackStack(stack: Stack): stack is PlayerAttackStack {
  return stack.type === 'playerAttack';
}

/**
 * StackがBreakStackかどうかを判定する型ガード
 */
export function isBreakStack(stack: Stack): stack is BreakStack {
  return stack.type === 'break';
}

/**
 * StackがDamageStackかどうかを判定する型ガード
 */
export function isDamageStack(stack: Stack): stack is DamageStack {
  return stack.type === 'damage';
}

/**
 * StackがWinStackかどうかを判定する型ガード
 */
export function isWinStack(stack: Stack): stack is WinStack {
  return stack.type === 'win';
}

/**
 * StackがClockupStackかどうかを判定する型ガード
 */
export function isClockupStack(stack: Stack): stack is ClockupStack {
  return stack.type === 'clockup';
}

/**
 * StackがClockdownStackかどうかを判定する型ガード
 */
export function isClockdownStack(stack: Stack): stack is ClockdownStack {
  return stack.type === 'clockdown';
}

// =============================================================================
// 全てのStack型のUnion
// =============================================================================

/** CardEvent のStack型 */
export type CardEventStack =
  | DriveStack
  | ClockupStack
  | ClockdownStack
  | OverclockStack
  | AttackStack
  | BlockStack
  | BattleStack
  | PlayerAttackStack
  | WinStack
  | DamageStack
  | BreakStack
  | DeleteStack
  | BounceStack
  | HandesStack
  | LostStack
  | MoveStack
  | ExtraSummonStack
  | BootStack
  | JokerStack;

/** CommonEvent のStack型 */
export type CommonEventStack =
  | ModifyCPStack
  | ModifyPurpleStack
  | TurnStartStack
  | TurnEndStack
  | InterceptStack
  | TriggerStack;

/** InternalEvent のStack型 */
export type InternalEventStack =
  | PostBattleStack
  | PostBattleClockUpStack
  | WithdrawStack
  | MessageReceivedStack
  | DeathCounterCheckStack
  | PreDriveStack;

/** 全てのStack型のUnion */
export type TypedStack = CardEventStack | CommonEventStack | InternalEventStack;

// =============================================================================
// イベント名からStack型を取得するユーティリティ型
// =============================================================================

import type { GameEvent } from './events';

/** イベント名からStack型を導出する型マッピング */
export type StackForEvent<E extends GameEvent> =
  // CardEvents
  E extends 'drive'
    ? DriveStack
    : E extends 'clockup'
      ? ClockupStack
      : E extends 'clockdown'
        ? ClockdownStack
        : E extends 'overclock'
          ? OverclockStack
          : E extends 'attack'
            ? AttackStack
            : E extends 'block'
              ? BlockStack
              : E extends 'battle'
                ? BattleStack
                : E extends 'playerAttack'
                  ? PlayerAttackStack
                  : E extends 'win'
                    ? WinStack
                    : E extends 'damage'
                      ? DamageStack
                      : E extends 'break'
                        ? BreakStack
                        : E extends 'delete'
                          ? DeleteStack
                          : E extends 'bounce'
                            ? BounceStack
                            : E extends 'handes'
                              ? HandesStack
                              : E extends 'lost'
                                ? LostStack
                                : E extends 'move'
                                  ? MoveStack
                                  : E extends 'extraSummon'
                                    ? ExtraSummonStack
                                    : E extends 'boot'
                                      ? BootStack
                                      : E extends 'joker'
                                        ? JokerStack
                                        : // CommonEvents
                                          E extends 'modifyCP'
                                          ? ModifyCPStack
                                          : E extends 'modifyPurple'
                                            ? ModifyPurpleStack
                                            : E extends 'turnStart'
                                              ? TurnStartStack
                                              : E extends 'turnEnd'
                                                ? TurnEndStack
                                                : E extends 'intercept'
                                                  ? InterceptStack
                                                  : E extends 'trigger'
                                                    ? TriggerStack
                                                    : // InternalEvents
                                                      E extends '_postBattle'
                                                      ? PostBattleStack
                                                      : E extends '_postBattleClockUp'
                                                        ? PostBattleClockUpStack
                                                        : E extends '_withdraw'
                                                          ? WithdrawStack
                                                          : E extends '_messageReceived'
                                                            ? MessageReceivedStack
                                                            : E extends '_deathCounterCheckStack'
                                                              ? DeathCounterCheckStack
                                                              : E extends '_preDrive'
                                                                ? PreDriveStack
                                                                : never;
