import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 起動効果
  isBootable: (core, self) => {
    const giants = self.owner.field.filter(unit => unit.catalog.species?.includes('巨人'));
    return giants.length >= 2;
  },

  onBootSelf: async (stack: StackWithCard<Unit>) => {
    const giants = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('巨人')
    );
    if (giants.length < 2) return;
    const inactiveGiants = giants.filter(unit => !unit.active);
    if (inactiveGiants.length === 0) return;
    const [target] = EffectHelper.random(inactiveGiants, 1);
    if (!target) return;
    await System.show(stack, '起動・偉力の覚醒', '行動権を回復');
    Effect.activate(stack, stack.processing, target, true);
  },

  // 召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const opponentUnits = stack.processing.owner.opponent.field;
    if (opponentUnits.length === 0) return;
    await System.show(stack, '終焉の魔眼', 'ランダムで1体に3000ダメージ\n5回繰り返す');
    for (let i = 0; i < 5; i++) {
      const [target] = EffectHelper.random(opponentUnits, 1);
      if (target) Effect.damage(stack, stack.processing, target, 3000);
    }
  },

  // 自分の【巨人】がアタックした時の効果
  onAttack: async (stack: StackWithCard<Unit>) => {
    if (
      stack.target instanceof Unit &&
      stack.target.catalog.species?.includes('巨人') &&
      stack.target.owner.id === stack.processing.owner.id
    ) {
      const opponentUnits = stack.processing.owner.opponent.field;
      if (opponentUnits.length === 0) return;
      await System.show(stack, '終焉の魔眼', 'ランダムで1体に3000ダメージ');
      const [target] = EffectHelper.random(opponentUnits, 1);
      if (target) Effect.damage(stack, stack.processing, target, 3000);
    }
  },
};
