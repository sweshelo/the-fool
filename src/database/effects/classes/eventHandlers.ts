import type { Event } from './event';

// 文字列の最初の文字を大文字にする型
type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;

// イベント名からハンドラー名を生成する型
type EventHandlerName<E extends string, Prefix extends string> = `${Prefix}${Capitalize<E>}`;

// チェックハンドラー型: checkDrive, checkClockup など
export type CheckHandlerName<E extends Event> = EventHandlerName<E, 'check'>;

// onハンドラー型: onDrive, onClockup など
export type OnHandlerName<E extends Event> = EventHandlerName<E, 'on'>;

// サフィックス付きハンドラー型
export type OnHandlerNameSelf<E extends Event> = `${OnHandlerName<E>}Self`;
export type OnHandlerNameOther<E extends Event> = `${OnHandlerName<E>}Other`;
export type OnHandlerNameInTrash<E extends Event> = `${OnHandlerName<E>}InTrash`;
export type OnHandlerNameOpponent<E extends Event> = `${OnHandlerName<E>}Opponent`;

// 全てのチェックハンドラー名のUnion型
export type AllCheckHandlerNames = CheckHandlerName<Event>;

// 全てのonハンドラー名のUnion型（サフィックスなし）
export type AllOnHandlerNames = OnHandlerName<Event>;

// 全てのonハンドラー名のUnion型（サフィックス付き含む）
export type AllOnHandlerNamesWithSuffix =
  | OnHandlerName<Event>
  | OnHandlerNameSelf<Event>
  | OnHandlerNameOther<Event>
  | OnHandlerNameInTrash<Event>
  | OnHandlerNameOpponent<Event>;

// 全てのハンドラー名のUnion型
export type AllHandlerNames = AllCheckHandlerNames | AllOnHandlerNamesWithSuffix;

// 共通のハンドラー型マッピング（factory.ts と types.ts で共有）
export type EventCheckHandlers<CheckMethod> = {
  [E in Event as CheckHandlerName<E>]?: CheckMethod;
};

export type EventOnHandlers<OnMethod> = {
  [E in Event as OnHandlerName<E>]?: OnMethod;
};

export type EventOnHandlersSelf<OnMethod> = {
  [E in Event as OnHandlerNameSelf<E>]?: OnMethod;
};

export type EventOnHandlersOther<OnMethod> = {
  [E in Event as OnHandlerNameOther<E>]?: OnMethod;
};

export type EventOnHandlersInTrash<OnMethod> = {
  [E in Event as OnHandlerNameInTrash<E>]?: OnMethod;
};

export type EventOnHandlersOpponent<OnMethod> = {
  [E in Event as OnHandlerNameOpponent<E>]?: OnMethod;
};
