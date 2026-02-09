import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (!(stack.target instanceof Unit)) return;

    // 対戦相手のコスト2以上のユニットがフィールドに出るたび
    if (stack.target.owner.id === opponent.id && stack.target.catalog.cost >= 2) {
      // ［あなたのフィールドの【天使】ユニット×1000］ダメージを与える。
      const damage =
        stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('天使')).length *
        1000;
      if (damage <= 0) return;

      if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
        await System.show(stack, '情熱のダンス', '［【天使】×1000］ダメージ');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'opponents',
          'ダメージを与えるユニットを選択',
          1
        );
        Effect.damage(stack, stack.processing, target, damage, 'effect');
      }
    }
  },
};
