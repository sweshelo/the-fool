import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 対戦相手のユニットがフィールドに出るたび、対戦相手の捨札に青属性のカードが5枚以上ある場合、
  // 対戦相手はあなたのユニットを1体選ぶ。それのレベルを+1する
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    const hasBlueCardAtLeast5InTrash =
      opponent.trash.filter(card => card.catalog.color === Color.BLUE).length >= 5;
    const isOpponentUnitDriven = stack.source.id === opponent.id;

    if (
      isOpponentUnitDriven &&
      hasBlueCardAtLeast5InTrash &&
      EffectHelper.isUnitSelectable(stack.core, 'owns', stack.processing.owner)
    ) {
      await System.show(stack, '＜ウィルス・溢＞', 'レベル+1');
      // 対戦相手があなたのユニットを1体選ぶ
      const [target] = await EffectHelper.pickUnit(
        stack,
        opponent,
        unit => unit.owner.id === stack.processing.owner.id,
        'レベルを+1するユニットを選択'
      );
      Effect.clock(stack, stack.processing, target, 1);
    }
  },
};
