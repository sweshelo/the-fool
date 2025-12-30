import type { Core } from '@/package/core/core';
import type { Catalog, ICard } from '../submodule/suit/types/game/card';
import type { Stack } from '@/package/core/class/stack';
import { getCardEffect } from './effects';
import type {
  EventCheckHandlers,
  EventOnHandlers,
  EventOnHandlersWithTargetSuffix,
  EventOnHandlersWithEventSuffix,
  HANDLER_SUFFIXES_TARGET,
  HANDLER_SUFFIXES_EVENT,
} from './effects/classes/eventHandlers';

export interface HandlerFunction {
  (stack: Stack, card: ICard, core: Core): Promise<void>;
}

// イベントハンドラー型の具体化
type CheckMethod = (stack: Stack) => boolean;

// 全てのサフィックス付きハンドラーを展開
type AllSuffixHandlers = Partial<
  EventOnHandlersWithTargetSuffix<HandlerFunction, (typeof HANDLER_SUFFIXES_TARGET)[number]> &
    EventOnHandlersWithEventSuffix<HandlerFunction, (typeof HANDLER_SUFFIXES_EVENT)[number]>
>;

export interface CatalogWithHandler
  extends
    Catalog,
    Partial<EventCheckHandlers<CheckMethod>>,
    Partial<EventOnHandlers<HandlerFunction>>,
    AllSuffixHandlers {
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
