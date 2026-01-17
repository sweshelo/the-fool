import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Choices } from '@/submodule/suit/types/game/system';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '詠唱・アクイラ', '[牽牛星アルタイル]を1枚引く');
    const target = stack.processing.owner.deck.find(
      card => card.catalog.name === '牽牛星アルタイル'
    );
    if (target) Effect.move(stack, stack.processing, target, 'hand');
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id) {
      switch (stack.target.catalog.name) {
        case '牽牛星アルタイル':
          if (stack.processing.owner.hand.length > 0) {
            await System.show(stack, '美しき白鳥の輝き', '手札を1枚捨てる\nカードを1枚引く');
            const choices: Choices = {
              title: '捨てるカードを選択してください',
              type: 'card',
              items: stack.processing.owner.hand,
              count: 1,
            };
            const [cardId] = await System.prompt(stack, stack.processing.owner.id, choices);
            const card = stack.processing.owner.hand.find(card => card.id === cardId);
            if (card) {
              Effect.handes(stack, stack.processing, card);
            }
            EffectTemplate.draw(stack.processing.owner, stack.core);
          }
          break;
        case '織女星ベガ':
          await System.show(stack, '美しき白鳥の輝き', '基本BP+1000\n【秩序の盾】を与える');
          stack.processing.owner.field.forEach(unit => {
            switch (unit.catalog.name) {
              case '天川星デネブ':
              case '牽牛星アルタイル':
              case '織女星ベガ':
                Effect.keyword(stack, stack.processing, unit, '秩序の盾');
                Effect.modifyBP(stack, stack.processing, unit, 1000, { isBaseBP: true });
            }
          });
          break;
      }
    }
  },
};
