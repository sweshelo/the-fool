import { Delta } from '@/package/core/class/delta';
import type { Choices } from '@/submodule/suit/types/game/system';
import { System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■誰がために道化は嗤う
  // あなたのターン開始時、あなたの手札のカードを1枚選ぶ。それのコストを-1する。

  checkTurnStart: (stack: StackWithCard): boolean => {
    // 自分のターン開始時であること、手札があることを確認
    return (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      stack.processing.owner.hand.length > 0
    );
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 手札がない場合は処理しない
    if (owner.hand.length === 0) return;

    await System.show(stack, '誰がために道化は嗤う', '手札のコスト-1');

    // 手札からカードを1枚選択
    const choices: Choices = {
      title: 'コストを-1するカードを選択',
      type: 'card',
      items: owner.hand,
      count: 1,
    };

    const [choice] = await System.prompt(stack, owner.id, choices);
    const target = owner.hand.find(card => card.id === choice);

    if (target) {
      // コストを-1する
      target.delta.push(new Delta({ type: 'cost', value: -1 }));
    }
  },
};
