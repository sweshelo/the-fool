import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

const effect = async (stack: StackWithCard) => {
  if (stack.processing.owner.opponent.field.length > 0) {
    await System.show(stack, '阿修羅連撃', '1000ダメージ×8');
    [...Array(8)].forEach(() => {
      const [target] = EffectHelper.random(stack.processing.owner.opponent.field);
      if (target) Effect.damage(stack, stack.processing, target, 1000, 'effect');
    });
  }
};

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: effect,
  onTurnEnd: async (stack: StackWithCard) => {
    if (stack.processing.owner.id === stack.source.id) await effect(stack);
  },
};
