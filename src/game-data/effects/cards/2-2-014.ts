import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Unit } from '@/package/core/class/card';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '援軍／海洋', '【海洋】ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '海洋' });
  },

  isBootable: (_core: Core, self: Unit): boolean => {
    return self.owner.hand.length > 0;
  },

  onBootSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '起動・ワンダーステラ', '手札を1枚選んで捨てる\nカードを1枚引く');
    const choices: Choices = {
      title: '捨てるカードを選択してください',
      type: 'card',
      items: stack.processing.owner.hand,
      count: 1,
    };
    const [response] = await System.prompt(stack, stack.processing.owner.id, choices);
    const target = stack.processing.owner.hand.find(card => card.id === response);
    if (target) {
      Effect.handes(stack, stack.processing, target);
      EffectTemplate.draw(stack.processing.owner, stack.core);
    }
  },
};
