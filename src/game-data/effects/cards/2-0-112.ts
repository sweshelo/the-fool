import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■受け継ぎし墓守
  // 対戦相手のターン開始時、このユニットが捨札にあり、あなたのフィールドにユニットが2体以下で、対戦相手の手札が2枚以下の場合、このユニットを捨札から【特殊召喚】する。
  onTurnStartInTrash: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit))
      throw new Error('Unitではないオブジェクトが指定されました');

    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    // 対戦相手のターン開始時かチェック
    const isOpponentTurn = stack.processing.owner.id !== stack.core.getTurnPlayer().id;
    // 自分のフィールドにユニットが2体以下かチェック
    const hasLessThan3Units = owner.field.length <= 2;
    // 対戦相手の手札が2枚以下かチェック
    const opponentHasLessThan3Cards = opponent.hand.length <= 2;

    if (isOpponentTurn && hasLessThan3Units && opponentHasLessThan3Cards) {
      // oxlint-disable-next-line no-floating-promises
      Effect.summon(stack, self, self);
      await System.show(stack, '受け継ぎし墓守', '【特殊召喚】');
    }
  },

  // ■墓暴きの代償
  // このユニットが破壊された時、対戦相手の手札が2枚以上の場合、対戦相手は自分の手札を1枚選んで捨てる。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    // 対戦相手の手札が2枚以上かチェック
    if (opponent.hand.length >= 2) {
      await System.show(stack, '墓暴きの代償', '対戦相手の手札を1枚捨てる');

      // 対戦相手に手札を1枚選択させる
      const [choice] = await System.prompt(stack, opponent.id, {
        title: '捨てるカードを1枚選択',
        type: 'card',
        items: opponent.hand,
        count: 1,
      });

      const selectedCard = opponent.hand.find(card => card.id === choice);
      if (selectedCard) {
        Effect.break(stack, stack.processing, selectedCard);
      }
    }
  },
};
