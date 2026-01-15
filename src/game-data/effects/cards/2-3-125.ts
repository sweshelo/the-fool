import { Card, type Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'メイクアップ', '秩序の盾\nトリガーゾーンのレベル+1');
    Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
    stack.processing.owner.trigger.forEach(card => (card.lv = Math.min(card.lv + 1, 3)));
  },

  onIntercept: async (stack: StackWithCard<Card>): Promise<void> => {
    if (stack.source.id === stack.processing.owner.id) {
      const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
      if (
        stack.option?.type === 'lv' &&
        stack.option.value >= 2 &&
        EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
      ) {
        await System.show(stack, 'ビューティートリック', '基本BP-1000');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          'ダメージを与えるユニットを選択して下さい',
          1
        );
        if (target) Effect.modifyBP(stack, stack.processing, target, -1000, { isBaseBP: true });
      }
    }
  },

  onTrigger: async (stack: StackWithCard<Card>): Promise<void> => {
    if (stack.source.id === stack.processing.owner.id) {
      if (stack.option?.type === 'lv' && stack.option.value >= 2) {
        await System.show(stack, 'ビューティートリック', '基本BP+1000');
        stack.processing.owner.field.forEach(unit =>
          Effect.modifyBP(stack, stack.processing, unit, 1000, { isBaseBP: true })
        );
      }
    }
  },
};
