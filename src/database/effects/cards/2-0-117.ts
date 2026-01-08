import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // ユニット: ウィークネス＆ドロー
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targetsFilter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;
    const targets_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      targetsFilter,
      stack.processing.owner
    );

    if (targets_selectable) {
      await System.show(stack, 'ウィークネス＆ドロー', '基本BP-5000\nカードを1枚引く');

      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        targetsFilter,
        '基本BPを下げるユニットを選択'
      );

      Effect.modifyBP(stack, stack.processing, target, -5000, { isBaseBP: true });
    } else {
      await System.show(stack, 'ドロー', 'カードを1枚引く');
    }
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
