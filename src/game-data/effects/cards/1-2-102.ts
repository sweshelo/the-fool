import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

// あなたの【不死】ユニットが破壊されるたび、対戦相手の全てのユニットに2000ダメージを与える。
const effect = async (stack: StackWithCard<Unit>) => {
  const owner = stack.processing.owner;
  const opponent = owner.opponent;
  const brokenUnit = stack.target;

  // 破壊されたのが自分の【不死】ユニットか確認
  if (
    !(brokenUnit instanceof Unit) ||
    brokenUnit.owner.id !== owner.id ||
    !brokenUnit.catalog.species?.includes('不死')
  ) {
    return;
  }

  // 対戦相手のフィールドにユニットがいるか確認
  if (opponent.field.length === 0) return;

  await System.show(stack, '怨念爆弾', '敵全体に2000ダメージ');
  opponent.field.forEach(unit => {
    Effect.damage(stack, stack.processing, unit, 2000);
  });
};

export const effects: CardEffects = {
  onBreakSelf: effect,
  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.target instanceof Unit && stack.processing.id !== stack.target.id) {
      await effect(stack);
    }
  },
};
