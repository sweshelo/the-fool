import type { Card } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // あなたのターン開始時
  checkTurnStart: (stack: StackWithCard<Card>): boolean => {
    // あなたのフィールドにユニットが1体以上いる場合に発動可能
    return stack.source.id === stack.processing.owner.id && stack.processing.owner.field.length > 0;
  },

  onTurnStart: async (stack: StackWithCard<Card>): Promise<void> => {
    const owner = stack.processing.owner;

    // あなたのユニットを1体選ぶ
    if (EffectHelper.isUnitSelectable(stack.core, 'owns', owner)) {
      await System.show(stack, 'チョークスリーパー', '選んだ以外の全ユニットの行動権を消費');

      const [keepUnit] = await EffectHelper.pickUnit(
        stack,
        owner,
        'owns',
        '行動権を残すユニットを選択'
      );

      // それ以外の全てのユニットの行動権を消費
      EffectHelper.exceptSelf(stack.core, keepUnit, unit =>
        Effect.activate(stack, stack.processing, unit, false)
      );
    }
  },
};
