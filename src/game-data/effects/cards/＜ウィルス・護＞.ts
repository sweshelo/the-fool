import { Unit } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant/color';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 対戦相手のユニットがフィールドに出るたび、対戦相手の捨札に黄属性のカードが5枚以上ある場合、それに【加護】を与える
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    const hasYellowCardAtLeast5InTrash =
      opponent.trash.filter(card => card.catalog.color === Color.YELLOW).length >= 5;
    const isOpponentUnitDriven = stack.source.id === opponent.id;

    if (isOpponentUnitDriven && hasYellowCardAtLeast5InTrash && stack.target instanceof Unit) {
      await System.show(stack, '＜ウィルス・護＞', '【加護】を付与');
      Effect.keyword(stack, stack.processing, stack.target, '加護');
    }
  },
};
