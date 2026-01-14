import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    return stack.processing.owner.id === stack.source.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const [choice] = await System.prompt(stack, owner.id, {
      type: 'option',
      title: '選略・魔導の心得',
      items: [
        { id: '1', description: '紫ゲージ+1' },
        { id: '2', description: 'デッキからインターセプトをセット' },
      ],
    });

    switch (choice) {
      case '1':
      default:
        await System.show(stack, '選略・魔導の心得', '紫ゲージ+１');
        await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
        break;
      case '2': {
        await System.show(stack, '選略・魔導の心得', 'デッキからインターセプトを1枚セット');
        const owner = stack.processing.owner;
        const intercepts = owner.deck.filter(card => card.catalog.type === 'intercept');
        const [target] = EffectHelper.random(intercepts);

        if (target) {
          Effect.move(stack, stack.processing, target, 'trigger');
        }
        break;
      }
    }
  },
};
