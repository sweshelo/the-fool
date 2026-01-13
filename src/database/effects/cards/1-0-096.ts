import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  checkBattle: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 戦闘中の自ユニットを特定
    const ownUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );

    // ユニットが存在し、フィールドにまだいる場合のみ発動
    return !!ownUnit && owner.field.some(unit => unit.id === ownUnit.id);
  },

  onBattle: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    // 戦闘中の自ユニットを特定
    const [target] = [stack.source, stack.target].filter(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );

    if (!target) return;

    await System.show(stack, '不可侵防壁', 'BP+3000');
    Effect.modifyBP(stack, stack.processing, target, 3000, { event: 'turnEnd', count: 1 });
  },
};
