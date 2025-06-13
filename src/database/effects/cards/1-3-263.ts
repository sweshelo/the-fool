import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ユニットがフィールドに出た時効果
  onDrive: async (stack: StackWithCard<Unit>) => {
    const ownerTrash = stack.processing.owner.trash.filter(
      card => card.catalog.cost <= 4 && card.catalog.type === 'unit'
    );
    const opponentTrash = stack.processing.owner.opponent.trash.filter(
      card => card.catalog.cost <= 2 && card.catalog.type === 'unit'
    );
    await System.show(stack, '鏡合わせの祈り', 'お互いに【特殊召喚】');

    const [ownerUnit] = EffectHelper.random(ownerTrash, 1);
    Effect.summon(stack, stack.processing, ownerUnit as Unit);

    const [opponentUnit] = EffectHelper.random(opponentTrash, 1);
    Effect.summon(stack, stack.processing, opponentUnit as Unit);
  },

  // checkDriveメソッド
  checkDrive: (stack: StackWithCard) => {
    const ownerTrash = stack.processing.owner.trash.filter(
      card => card.catalog.cost <= 4 && card.catalog.type === 'unit'
    );
    const opponentTrash = stack.processing.owner.opponent.trash.filter(
      card => card.catalog.cost <= 2 && card.catalog.type === 'unit'
    );

    return (
      ownerTrash.length > 0 &&
      opponentTrash.length > 0 &&
      stack.processing.owner.field.length <= 4 &&
      stack.processing.owner.opponent.field.length <= 4
    );
  },
};
