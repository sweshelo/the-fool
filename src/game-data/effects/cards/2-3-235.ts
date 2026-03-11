import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant';

/** colorsの中で最も多い属性を返す。同数の属性が複数ある場合は undefined を返す */
const getDominantColor = (colors: number[]): number | undefined => {
  const colorCount = colors.reduce<Record<string, number>>((acc, color) => {
    acc[color] = (acc[color] ?? 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(...Object.values(colorCount));
  const topColors = Object.entries(colorCount).filter(([, count]) => count === maxCount);
  if (topColors.length !== 1) return undefined;
  return Number(topColors[0]?.[0]);
};

export const effects: CardEffects = {
  checkTurnStart: (stack: StackWithCard) =>
    stack.source.id === stack.processing.owner.id &&
    stack.processing.owner.field.length <= 4 &&
    getDominantColor(stack.processing.owner.field.map(unit => unit.catalog.color)) !== undefined,
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, 'フルーツバスケット', '[フルーツガール]を【特殊召喚】');
    const color = getDominantColor(stack.processing.owner.field.map(unit => unit.catalog.color));

    switch (color) {
      case Color.RED: {
        await Effect.summon(stack, stack.processing, new Unit(stack.processing.owner, '2-1-004'));
        break;
      }
      case Color.YELLOW: {
        await Effect.summon(stack, stack.processing, new Unit(stack.processing.owner, '2-1-009'));
        break;
      }
      case Color.BLUE: {
        await Effect.summon(stack, stack.processing, new Unit(stack.processing.owner, '2-1-014'));
        break;
      }
      case Color.GREEN: {
        await Effect.summon(stack, stack.processing, new Unit(stack.processing.owner, '2-1-019'));
        break;
      }
      case Color.PURPLE: {
        await Effect.summon(stack, stack.processing, new Unit(stack.processing.owner, '2-1-025'));
        break;
      }
    }
  },
};
