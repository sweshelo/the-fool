import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    const isOpponentUnit =
      EffectHelper.owner(stack.core, stack.target).id ===
      EffectHelper.owner(stack.core, stack.processing).id;
    const hasHand = EffectHelper.owner(stack.core, stack.processing).hand.length > 0;
    const isRemainDeck = EffectHelper.owner(stack.core, stack.processing).deck.length > 0;
    return isOpponentUnit && hasHand && isRemainDeck;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard) => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    const owner = EffectHelper.owner(stack.core, stack.processing);

    if (stack.processing.lv <= 2) {
      await System.show(stack, '無限の魔法石', '手札を1枚選んで捨てる\nデッキから1枚選んで引く');
      const discardChoices: Choices = {
        title: '捨てるカードを選択してください',
        type: 'card',
        items: owner.hand,
        count: 1,
      };
      const [discard] = await System.prompt(stack, owner.id, discardChoices);
      const discardTarget = owner.hand.find(card => card.id === discard);
      if (!discardTarget) throw new Error('正しいカードが選択されませんでした');
      Effect.handes(stack, stack.processing, discardTarget);
    } else {
      await System.show(stack, '無限の魔法石', 'デッキから1枚選んで引く');
    }

    const drawChoices: Choices = {
      title: '手札に加えるカードを選択してください',
      type: 'card',
      items: owner.deck,
      count: 1,
    };
    const [draw] = await System.prompt(stack, owner.id, drawChoices);
    const drawTarget = owner.deck.find(card => card.id === draw);
    if (!drawTarget) throw new Error('正しいカードが選択されませんでした');
    Effect.move(stack, stack.processing, drawTarget, 'hand');
  },
};
