import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import { Unit, type Card } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { Choices } from '@/submodule/suit/types/game/system';

export const effects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: Stack, card: Card, core: Core): boolean => {
    const isOpponentUnit =
      EffectHelper.owner(core, stack.source).id !== EffectHelper.owner(core, card).id;
    const isUnit =
      EffectHelper.owner(core, stack.source).find(stack.source).place?.name === 'field';
    const hasHand = EffectHelper.owner(core, card).hand.length > 0;
    return isOpponentUnit && isUnit && hasHand;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: Stack, card: Card, core: Core) => {
    const owner = EffectHelper.owner(core, card);
    await System.show(
      stack,
      core,
      'デストラクションスピア',
      '手札を1枚選んで捨てる\nユニットを破壊\n1ライフダメージ'
    );
    const choices: Choices = {
      title: '捨てるカードを選択してください',
      type: 'card',
      items: owner.hand,
      count: 1,
    };

    const [response] = await System.prompt(stack, core, owner.id, choices);
    Effect.break(stack, core, card, stack.source as Unit);
    const target = owner.hand.find(card => card.id === response);
    if (!target) throw new Error('正しいカードが選択されませんでした');

    owner.hand = owner.hand.filter(card => card.id !== response);
    owner.trash.unshift(target);
  },
};
