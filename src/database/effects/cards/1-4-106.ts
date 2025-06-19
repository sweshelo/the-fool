import { Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■トリガードロー
  // このユニットがフィールドに出た時、あなたはトリガーカードを1枚引く。

  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'トリガードロー', 'トリガーカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
  },
};
