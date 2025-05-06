import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '詠唱・キグヌス', '[天川星デネブ]を1枚引く');
    const target = stack.processing.owner.deck.find(card => card.catalog.name === '天川星デネブ');
    if (target) Effect.move(stack, stack.processing, target, 'hand');
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id) {
      switch (stack.target.catalog.name) {
        case '天川星デネブ':
          await System.show(stack, '神秘な琴の音色', 'トリガーカードを1枚引く');
          EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
          break;
        case '牽牛星アルタイル':
          await System.show(stack, '神秘な琴の音色', '基本BP+1000\n【次元干渉/コスト3】を与える');
          stack.processing.owner.field.filter(unit => {
            switch (unit.catalog.name) {
              case '天川星デネブ':
              case '牽牛星アルタイル':
              case '織女星ベガ':
                Effect.keyword(stack, stack.processing, unit, '次元干渉', { cost: 3 });
                Effect.modifyBP(stack, stack.processing, unit, 1000, true);
            }
          });
          break;
      }
    }
  },
};
