import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // あなたのユニットが戦闘した時、ターン終了時までそれのBPを+1000し、戦闘終了時まで【貫通】を与える。
  checkBattle: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 戦闘中の自ユニットを特定
    const ownUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );

    // ユニットが存在し、フィールドにまだいる場合のみ発動
    return !!ownUnit && owner.field.some(unit => unit.id === ownUnit.id);
  },

  onBattle: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 戦闘中の自ユニットを特定
    const [battleUnit] = [stack.source, stack.target].filter(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );

    if (!battleUnit) return;

    await System.show(stack, '正拳突き', 'BP+1000\n【貫通】を得る');

    // BP+1000（ターン終了時まで）
    Effect.modifyBP(stack, stack.processing, battleUnit, 1000, {
      event: 'turnEnd',
      count: 1,
    });

    // 【貫通】を付与（戦闘終了時まで）
    Effect.keyword(stack, stack.processing, battleUnit, '貫通', {
      event: '_postBattle',
      count: 1,
    });
  },
};
