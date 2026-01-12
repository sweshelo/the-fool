import { Unit } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant/color';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 対戦相手のユニットがフィールドに出るたび、対戦相手の捨札に緑属性のカードが5枚以上ある場合、
  // それの基本BPを+1000し、【貫通】を与える
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    const hasGreenCardAtLeast5InTrash =
      opponent.trash.filter(card => card.catalog.color === Color.GREEN).length >= 5;
    const isOpponentUnitDriven = stack.source.id === opponent.id;

    if (isOpponentUnitDriven && hasGreenCardAtLeast5InTrash && stack.target instanceof Unit) {
      await System.show(stack, '＜ウィルス・貫＞', '基本BP+1000\n【貫通】付与');
      Effect.modifyBP(stack, stack.processing, stack.target, 1000, { isBaseBP: true });
      Effect.keyword(stack, stack.processing, stack.target, '貫通');
    }
  },
};
