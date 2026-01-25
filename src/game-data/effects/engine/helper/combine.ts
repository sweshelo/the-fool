import type { Stack } from '@/package/core/class/stack';
import { System } from '../system';

export interface Effect {
  title: string;
  description: string;
  condition?: () => boolean;
  effect: () => unknown;
  order?: number; // 低い値が先に実行（デフォルト: 0）
}

export const helperCombine = async (stack: Stack, effects: Effect[]) => {
  const available = effects.filter(effect => (effect.condition ? effect.condition() : true));
  const title = [...new Set(available.map(effect => effect.title))].join('＆');
  const description = available.map(effect => effect.description).join('\n');

  // order でソート（低い値が先、未指定は 0 扱い）
  const sorted = [...available].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // 効果を発動できる場合
  if (sorted.length > 0) {
    await System.show(stack, title, description);
    for (const process of sorted.map(effect => effect.effect)) {
      await process();
    }
  }
};
