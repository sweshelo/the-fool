import type { GameEvent, CardEvent } from './events';

// 文字列の最初の文字を大文字にする型
type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;

// イベント名からハンドラー名を生成する型
type EventHandlerName<E extends string, Prefix extends string> = `${Prefix}${Capitalize<E>}`;

// チェックハンドラー型: checkDrive, checkClockup など
export type CheckHandlerName<E extends GameEvent> = EventHandlerName<E, 'check'>;

// onハンドラー型: onDrive, onClockup など
export type OnHandlerName<E extends GameEvent> = EventHandlerName<E, 'on'>;

// ハンドラーのサフィックス定数
export const HANDLER_SUFFIXES_TARGET = ['Self'] as const;
export const HANDLER_SUFFIXES_EVENT = ['InTrash'] as const;
export type HandlerSuffixTarget = (typeof HANDLER_SUFFIXES_TARGET)[number];
export type HandlerSuffixEvent = (typeof HANDLER_SUFFIXES_EVENT)[number];
export type HandlerSuffix = HandlerSuffixTarget | HandlerSuffixEvent;

// サフィックス付きハンドラー型（TARGET系: CardEventsのみ）: onDriveSelf など
export type OnHandlerNameWithTargetSuffix<
  E extends CardEvent,
  S extends HandlerSuffixTarget,
> = `${OnHandlerName<E>}${S}`;

// サフィックス付きハンドラー型（EVENT系: 全てのGameEvent）: onDriveInTrash, onTurnStartInTrash など
export type OnHandlerNameWithEventSuffix<
  E extends GameEvent,
  S extends HandlerSuffixEvent,
> = `${OnHandlerName<E>}${S}`;

// 全てのチェックハンドラー名のUnion型
export type AllCheckHandlerNames = CheckHandlerName<GameEvent>;

// 全てのonハンドラー名のUnion型（サフィックスなし）
export type AllOnHandlerNames = OnHandlerName<GameEvent>;

// 全てのonハンドラー名のUnion型（サフィックス付き含む）
export type AllOnHandlerNamesWithSuffix =
  | OnHandlerName<GameEvent>
  | OnHandlerNameWithTargetSuffix<CardEvent, HandlerSuffixTarget>
  | OnHandlerNameWithEventSuffix<GameEvent, HandlerSuffixEvent>;

// 全てのハンドラー名のUnion型
export type AllHandlerNames = AllCheckHandlerNames | AllOnHandlerNamesWithSuffix;

// 共通のハンドラー型マッピング（factory.ts と types.ts で共有）
export type EventCheckHandlers<CheckMethod> = {
  [E in GameEvent as CheckHandlerName<E>]?: CheckMethod;
};

export type EventOnHandlers<OnMethod> = {
  [E in GameEvent as OnHandlerName<E>]?: OnMethod;
};

export type EventOnHandlersWithTargetSuffix<OnMethod, S extends HandlerSuffixTarget> = {
  [E in CardEvent as OnHandlerNameWithTargetSuffix<E, S>]?: OnMethod;
};

export type EventOnHandlersWithEventSuffix<OnMethod, S extends HandlerSuffixEvent> = {
  [E in GameEvent as OnHandlerNameWithEventSuffix<E, S>]?: OnMethod;
};
