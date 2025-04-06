import type { Core } from '@/package/core/core';
import type { Catalog, ICard } from '../submodule/suit/types/game/card';
import type { Stack } from '@/package/core/class/stack';
import { getCardEffect } from './effects';

export interface HandlerFunction {
  (stack: Stack, card: ICard, core: Core): Promise<void>;
}

export interface CatalogWithHandler extends Catalog {
  onDrive?: HandlerFunction;
  onDriveSelf?: HandlerFunction;
  onBreak?: HandlerFunction;
  onDamage?: HandlerFunction;
  onDraw?: HandlerFunction;
  onOverclock?: HandlerFunction;
  onOverclockSelf?: HandlerFunction;
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
