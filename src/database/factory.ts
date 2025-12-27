import type { Core } from '@/package/core/core';
import type { Catalog, ICard } from '../submodule/suit/types/game/card';
import type { Stack } from '@/package/core/class/stack';
import { getCardEffect } from './effects';
import type { Event } from './effects/classes/event';
import type {
  CheckHandlerName,
  OnHandlerName,
  OnHandlerNameSelf,
  OnHandlerNameOther,
  OnHandlerNameInTrash,
  OnHandlerNameOpponent,
} from './effects/classes/eventHandlers';

export interface HandlerFunction {
  (stack: Stack, card: ICard, core: Core): Promise<void>;
}

// 全イベントに対するハンドラーを動的に生成
type EventCheckHandlers = {
  [E in Event as CheckHandlerName<E>]?: (stack: Stack) => boolean;
};

type EventOnHandlers = {
  [E in Event as OnHandlerName<E>]?: HandlerFunction;
};

type EventOnHandlersSelf = {
  [E in Event as OnHandlerNameSelf<E>]?: HandlerFunction;
};

type EventOnHandlersOther = {
  [E in Event as OnHandlerNameOther<E>]?: HandlerFunction;
};

type EventOnHandlersInTrash = {
  [E in Event as OnHandlerNameInTrash<E>]?: HandlerFunction;
};

type EventOnHandlersOpponent = {
  [E in Event as OnHandlerNameOpponent<E>]?: HandlerFunction;
};

export interface CatalogWithHandler
  extends Catalog,
    Partial<EventCheckHandlers>,
    Partial<EventOnHandlers>,
    Partial<EventOnHandlersSelf>,
    Partial<EventOnHandlersOther>,
    Partial<EventOnHandlersInTrash>,
    Partial<EventOnHandlersOpponent> {
  fieldEffect?: (stack: Stack) => void;
  handEffect?: (core: Core, card: ICard) => void;
  [key: string]: unknown;
}

export function effectFactory(catalog: CatalogWithHandler): void {
  // カードIDから効果を取得
  const cardEffect = getCardEffect(catalog.id);

  if (cardEffect) {
    // 効果が見つかった場合、カタログに適用
    Object.entries(cardEffect).forEach(([key, handler]) => {
      catalog[key] = handler;
    });
  }
}
