import { Unit } from '@/package/core/class/card';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onPlayerAttackSelf: async (stack: StackWithCard) => {
    const targets = stack.processing.owner.opponent.field.filter(unit =>
      unit.hasKeyword('防御禁止')
    );
    if (targets.length > 0) {
      await System.show(stack, 'ご褒美よ！', '【防御禁止】に5000ダメージ');
    }
  },
  onPlayerAttack: async (stack: StackWithCard) => {
    if (
      stack.source instanceof Unit &&
      stack.source.owner.id !== stack.processing.owner.id &&
      stack.source.owner.field.some(unit => unit.id === stack.source.id)
    ) {
      await System.show(stack, 'まってなさい！', '【防御禁止】を付与');
    }
  },
};
