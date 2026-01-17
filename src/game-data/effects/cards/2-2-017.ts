import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, '霜雪の抜刀', 'レベルを3にする');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'レベルを3にするユニットを選択'
      );
      if (target) {
        Effect.clock(stack, stack.processing, target, +2);
      }
    }
  },

  onOverclockSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.opponent.hand.length > 0) {
      await System.show(stack, '雪解けの一閃', '手札を公開する\n1枚選び破壊');
      const choices: Choices = {
        title: '破壊するカードを選択してください',
        type: 'card',
        items: stack.processing.owner.opponent.hand,
        count: 1,
      };
      const [cardId] = await System.prompt(stack, stack.processing.owner.id, choices);
      const card = stack.processing.owner.opponent.hand.find(card => card.id === cardId);

      if (card) Effect.handes(stack, stack.processing, card);
    }
  },
};
