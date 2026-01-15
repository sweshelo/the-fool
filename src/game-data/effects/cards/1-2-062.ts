import { Evolve } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';

export const effects: CardEffects = {
  // 生存確認と進化・所有者チェック
  checkDrive: stack =>
    stack.target instanceof Evolve &&
    stack.target.owner.id !== stack.processing.owner.id &&
    stack.target.owner.field.some(unit => unit.id === stack.target?.id),
  onDrive: async (stack: StackWithCard) => {
    const isRemainUnits = stack.processing.owner.field.length !== 0;
    if (!(stack.target instanceof Evolve)) return;
    if (isRemainUnits) {
      await System.show(stack, '人の業', '行動権を消費');
      Effect.activate(stack, stack.processing, stack.target, false);
    } else {
      await System.show(stack, '人の業', 'フィールドに出たユニットを破壊\n1ライフダメージ');
      Effect.break(stack, stack.processing, stack.target);
      Effect.modifyLife(stack, stack.processing, stack.target.owner, -1);
    }
  },
};
