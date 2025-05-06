import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    const target = stack.target;
    if (!(target instanceof Unit)) return false;

    const candidate = stack.processing.owner.deck.filter(
      unit => unit.catalog.cost === target.catalog.cost && unit.catalog.type === 'unit'
    );
    return (
      stack.processing.owner.id === stack.source.id &&
      stack.processing.owner.field.length <= 4 &&
      candidate.length > 0
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const target = stack.target as Unit;
    const candidate = stack.processing.owner.deck.filter(
      unit => unit.catalog.cost === target.catalog.cost && unit.catalog.type === 'unit'
    );

    await System.show(
      stack,
      'ディメンションゲート',
      'フィールドに出たユニットを破壊\n同じコストのユニットを【特殊召喚】'
    );
    EffectHelper.random(candidate, 1).forEach(unit =>
      Effect.summon(stack, stack.processing, unit as Unit)
    );
    Effect.break(stack, stack.processing, target, 'effect');
  },
};
