import type { Stack } from '@/package/core/class/stack';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { Choices } from '@/submodule/suit/types/game/system';

export const effects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: Stack): boolean => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    const isOpponentUnit =
      EffectHelper.owner(stack.core, stack.source).id !==
      EffectHelper.owner(stack.core, stack.processing).id;
    const isUnit =
      EffectHelper.owner(stack.core, stack.source).find(stack.source).place?.name === 'field';
    const hasHand = EffectHelper.owner(stack.core, stack.processing).hand.length > 0;
    return isOpponentUnit && isUnit && hasHand;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: Stack) => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    const owner = EffectHelper.owner(stack.core, stack.processing);
    await System.show(
      stack,
      'デストラクションスピア',
      '手札を1枚選んで捨てる\nユニットを破壊\n1ライフダメージ'
    );
    const choices: Choices = {
      title: '捨てるカードを選択してください',
      type: 'card',
      items: owner.hand,
      count: 1,
    };

    const [response] = await System.prompt(stack, owner.id, choices);
    Effect.break(stack, stack.processing, stack.source as Unit);
    const target = owner.hand.find(card => card.id === response);
    if (!target) throw new Error('正しいカードが選択されませんでした');
    Effect.handes(stack, stack.processing, target);
  },
};
