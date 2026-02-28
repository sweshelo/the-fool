import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkBattle: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 戦闘中の自ユニットを特定
    const ownUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );

    // ユニットが存在し、フィールドにまだいる場合のみ発動
    return (
      !!ownUnit && owner.field.some(unit => unit.id === ownUnit.id) && opponent.field.length > 0
    );
  },

  onBattle: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 戦闘中の自ユニットを特定
    const [target] = [stack.source, stack.target].filter(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );

    if (!target) return;

    await System.show(stack, '蜀漢の英雄・趙雲', 'BP+4000\n敵全体の基本BP+1000');
    Effect.modifyBP(stack, stack.processing, target, 4000, { event: 'turnEnd', count: 1 });
    owner.opponent.field.forEach(unit =>
      Effect.modifyBP(stack, stack.processing, unit, 1000, { isBaseBP: true })
    );
  },
};
