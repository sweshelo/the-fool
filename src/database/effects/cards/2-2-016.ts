import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '詠唱・リーラ', '[織女星ベガ]を1枚引く');
    const target = stack.processing.owner.deck.find(card => card.catalog.name === '織女星ベガ');
    if (target) Effect.move(stack, stack.processing, target, 'hand');
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id) {
      switch (stack.target.catalog.name) {
        case '織女星ベガ':
          await System.show(stack, '勇敢な鷲の意志', 'インターセプトカードを1枚引く');
          EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
          break;
        case '天川星デネブ':
          if (stack.processing.owner.opponent.field.length > 0) {
            await System.show(stack, '勇敢な鷲の意志', '基本BP-1000\n【沈黙】を与える');
            EffectHelper.random(stack.processing.owner.opponent.field, 3).forEach(unit => {
              Effect.keyword(stack, stack.processing, unit, '沈黙');
              Effect.modifyBP(stack, stack.processing, unit, -1000, { isBaseBP: true });
            });
          }
          break;
      }
    }
  },
};
