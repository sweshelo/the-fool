import type { Event } from './event';

// 文字列の最初の文字を大文字にする型
type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;

// イベント名からハンドラー名を生成する型
type EventHandlerName<E extends string, Prefix extends string> = `${Prefix}${Capitalize<E>}`;

// チェックハンドラー型: checkDrive, checkClockup など
export type CheckHandlerName<E extends Event> = EventHandlerName<E, 'check'>;

// onハンドラー型: onDrive, onClockup など
export type OnHandlerName<E extends Event> = EventHandlerName<E, 'on'>;

// ハンドラーのサフィックス定数
export const HANDLER_SUFFIXES = ['Self', 'Other', 'InTrash', 'Opponent'] as const;
export type HandlerSuffix = (typeof HANDLER_SUFFIXES)[number];

// サフィックス付きハンドラー型: onDriveSelf, onDriveOther など
export type OnHandlerNameWithSuffix<
  E extends Event,
  S extends HandlerSuffix,
> = `${OnHandlerName<E>}${S}`;

// 全てのチェックハンドラー名のUnion型
export type AllCheckHandlerNames = CheckHandlerName<Event>;

// 全てのonハンドラー名のUnion型（サフィックスなし）
export type AllOnHandlerNames = OnHandlerName<Event>;

// 全てのonハンドラー名のUnion型（サフィックス付き含む）
export type AllOnHandlerNamesWithSuffix =
  | OnHandlerName<Event>
  | OnHandlerNameWithSuffix<Event, HandlerSuffix>;

// 全てのハンドラー名のUnion型
export type AllHandlerNames = AllCheckHandlerNames | AllOnHandlerNamesWithSuffix;

// 共通のハンドラー型マッピング（factory.ts と types.ts で共有）
export type EventCheckHandlers<CheckMethod> = {
  [E in Event as CheckHandlerName<E>]?: CheckMethod;
};

export type EventOnHandlers<OnMethod> = {
  [E in Event as OnHandlerName<E>]?: OnMethod;
};

export type EventOnHandlersWithSuffix<OnMethod, S extends HandlerSuffix> = {
  [E in Event as OnHandlerNameWithSuffix<E, S>]?: OnMethod;
};
