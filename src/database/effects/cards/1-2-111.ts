import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // シャイニングオーラ：ユニットがアタックした時、レベルに応じた効果が発動
  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    const level = stack.processing.lv;

    // レベル1～2の効果
    if (level >= 1 && level <= 2) {
      const targets = EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id === stack.processing.owner.opponent.id,
        stack.processing.owner
      );

      if (targets.length > 0) {
        await System.show(stack, 'シャイニングオーラ', '行動権を消費');

        const [target] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          targets,
          '行動権を消費するユニットを選択'
        );

        Effect.activate(stack, stack.processing, target, false);
      }
    }
    // レベル3の効果
    else if (level === 3) {
      const targets = EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id === stack.processing.owner.opponent.id,
        stack.processing.owner
      );

      if (targets.length > 0) {
        await System.show(stack, 'シャイニングオーラ', '対戦相手のユニットを消滅\nレベル-2');

        // 選択可能な数を決定（最大2体）
        const selectCount = Math.min(2, targets.length);

        // 対戦相手のユニットを選択
        const selectedTargets = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          targets,
          '消滅させるユニットを選択',
          selectCount
        );

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
