import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットが戦闘した時、そのユニットが戦闘中の相手ユニットよりBPが低い場合
  checkBattle: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 戦闘中の自ユニットを特定
    const ownUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );
    // 戦闘中の相手ユニットを特定
    const opponentUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id !== owner.id
    );
    // ユニットが存在し、フィールドにまだいる場合のみ発動
    // 自ユニットが相手ユニットよりBPが低い場合
    return (
      !!ownUnit &&
      !!opponentUnit &&
      ownUnit.currentBP < opponentUnit.currentBP &&
      owner.field.some(unit => unit.id === ownUnit.id)
    );
  },

  // 戦闘終了時までそれに【不滅】を与える
  onBattle: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    // 戦闘中の自ユニットを特定
    const [target] = [stack.source, stack.target].filter(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );

    if (!target) return;

    await System.show(stack, 'ハニートラップ', '【不滅】を付与');
    Effect.keyword(stack, stack.processing, target, '不滅', {
      event: 'turnEnd',
      count: 1,
    });
  },
};
