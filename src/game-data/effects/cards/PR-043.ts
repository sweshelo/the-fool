import { Intercept, Unit, Card } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Effect, EffectTemplate } from '..';
import { EffectHelper } from '../engine/helper';
import { System } from '..';

export const effects: CardEffects = {
  // インターセプト発動時効果
  onIntercept: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    // 対戦相手のインターセプトの場合のみ発動
    if (stack.target instanceof Intercept && stack.target.owner.id === opponent.id) {
      // 対戦相手のレベル2以上のユニットを1体選ぶ
      const filter = (unit: Unit) => unit.owner.id === opponent.id && unit.lv >= 2;
      if (EffectHelper.isUnitSelectable(stack.core, filter, owner)) {
        await System.show(stack, 'デス・クリスマスマジック', 'レベル2以上のユニットを破壊');
        const target = await EffectHelper.pickUnit(
          stack,
          owner,
          filter,
          'レベル2以上のユニットを選ぶ'
        );
        // それを破壊する
        target.forEach(async unit => {
          Effect.break(stack, stack.processing, unit, 'effect');
        });
      }
    }
  },

  // トリガーが破壊された時の効果
  onLost: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分のトリガーカードが相手の効果によって破壊された時のみ発動
    if (
      stack.source instanceof Card &&
      stack.source.owner.id === opponent.id &&
      stack.target &&
      stack.target instanceof Card &&
      stack.target.owner.id === owner.id
    ) {
      // インターセプトカードを2枚引く
      await System.show(stack, 'デス・クリスマスマジック', 'インターセプトを2枚引く');
      EffectHelper.repeat(2, () =>
        EffectTemplate.reinforcements(stack, owner, { type: ['intercept'] })
      );
    }
  },
};
