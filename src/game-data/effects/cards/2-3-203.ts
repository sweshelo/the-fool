import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    // ［あなたのフィールドの【天使】ユニット×1500］ダメージを与える。
    const damage =
      stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('天使')).length *
      1500;
    if (damage <= 0) return;

    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, '墜天の刻印', '［【天使】×1500］ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択',
        1
      );
      Effect.damage(stack, stack.processing, target, damage, 'effect', '墜天の刻印');
    }
  },

  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分の効果で破壊されたかチェック
    if (
      stack.source.id === stack.processing.id &&
      stack.target instanceof Unit &&
      stack.target.owner.id === opponent.id &&
      stack.target.delta.some(
        delta => delta.effect.type === 'damage' && delta.source?.effectCode === '墜天の刻印'
      )
    ) {
      // フィールドの【天使】ユニットを選択
      const filter = (unit: Unit) => unit.catalog.species?.includes('天使');
      if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        await System.show(stack, '墜天の刻印', '【スピードムーブ】を付与する');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          '【スピードムーブ】を与えるユニットを選択',
          1
        );
        Effect.speedMove(stack, target);
      }
    }
  },
};
