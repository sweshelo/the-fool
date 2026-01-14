import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // シャイニングオーラ：ユニットがアタックした時、レベルに応じた効果が発動
  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    const level = stack.processing.lv;
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;

    // レベル1～2の効果
    if (level >= 1 && level <= 2) {
      if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        await System.show(stack, 'シャイニングオーラ', '行動権を消費');

        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          '行動権を消費するユニットを選択'
        );

        Effect.activate(stack, stack.processing, target, false);
      }
    }
    // レベル3の効果
    else if (level === 3) {
      if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        await System.show(stack, 'シャイニングオーラ', '対戦相手のユニットを消滅\nレベル-2');

        // 対戦相手のユニットを選択（最大2体）
        const selectedTargets: Unit[] = [];

        for (let i = 0; i < 2; i++) {
          const remainingFilter = (unit: Unit) =>
            unit.owner.id === stack.processing.owner.opponent.id &&
            !selectedTargets.some(selected => selected.id === unit.id);

          if (!EffectHelper.isUnitSelectable(stack.core, remainingFilter, stack.processing.owner))
            break;

          const [target] = await EffectHelper.pickUnit(
            stack,
            stack.processing.owner,
            remainingFilter,
            '消滅させるユニットを選択'
          );
          selectedTargets.push(target);
        }

        // 選択したユニットを消滅
        selectedTargets.forEach(target => {
          Effect.delete(stack, stack.processing, target);
        });

        // 自身のレベルを-2する
        Effect.clock(stack, stack.processing, stack.processing, -2);
      }
    }
  },
};
