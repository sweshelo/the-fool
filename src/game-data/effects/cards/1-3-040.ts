import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットが戦闘した時、そのユニットが戦闘中の相手ユニットよりBPが低い場合、
  // ターン終了時まで戦闘中のあなたのユニットのBPを+4000する
  checkBattle: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 戦闘中の自ユニットを特定
    const ownUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );
    // 戦闘中の相手ユニットを特定
    const opponentUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id === opponent.id
    );

    // ユニットが存在し、フィールドにまだいる場合のみ発動
    return (
      !!ownUnit &&
      !!opponentUnit &&
      ownUnit.currentBP < opponentUnit.currentBP &&
      owner.field.some(unit => unit.id === ownUnit.id)
    );
  },

  onBattle: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 戦闘中の自ユニットを特定
    const ownUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );

    if (ownUnit) {
      await System.show(stack, '勇猛なる決起', 'BP+4000');
      Effect.modifyBP(stack, stack.processing, ownUnit, 4000, {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
