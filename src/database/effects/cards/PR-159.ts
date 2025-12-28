import { Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.processing.owner.id === stack.source.id &&
      stack.target instanceof Unit &&
      stack.target.catalog.color === Color.BLUE
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '求愛のダンス', 'トリガーカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
  },

  checkPlayerAttack: (stack: StackWithCard) => {
    return (
      stack.source instanceof Unit &&
      stack.source.owner.id === stack.processing.owner.id &&
      stack.source.catalog.color === Color.BLUE
    );
  },

  onPlayerAttack: async (stack: StackWithCard) => {
    await System.show(stack, '求愛のダンス', '捨札から1枚選んで回収');
    await EffectTemplate.revive(stack, 1);
  },
};
