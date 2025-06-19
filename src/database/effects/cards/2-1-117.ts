import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    const [choice] =
      owner.cp.current >= 2
        ? await System.prompt(stack, owner.id, {
            type: 'option',
            title: '選略・デルタの輝き',
            items: [
              { id: '1', description: '効果なし' },
              { id: '2', description: 'CP-2\nカードを2枚引く' },
            ],
          })
        : ['1'];

    if (choice === '2') {
      await System.show(stack, '選略・デルタの輝き', 'CP-2\nカードを2枚引く');
      Effect.modifyCP(stack, stack.processing, owner, -2);
      [...Array(2)].forEach(() => EffectTemplate.draw(owner, stack.core));
    }
  },
};
