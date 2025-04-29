// FIXME: 何故か対戦相手のターン中に発動可能になるバグが有る

import type { Card } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: async (stack: StackWithCard): Promise<boolean> => {
    const isOwnUnit = stack.processing.owner.id === (stack.source as Card).owner.id;
    return isOwnUnit;
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
        stack.core.room.soundEffect('purple-increase');
        // TODO: 紫ゲージを実装する
        break;
      case '2': {
        await System.show(stack, '選略・魔導の心得', 'デッキからインターセプトを1枚セット');
        const owner = EffectHelper.owner(stack.core, stack.processing);
        const intercepts = owner.deck.filter(card => card.catalog.type === 'intercept');
        const target = intercepts[Math.ceil(Math.random() * intercepts.length - 1)];

        if (target) {
          Effect.move(stack, stack.processing, target, 'trigger');
        }
        break;
      }
    }
  },
};
