import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、対戦相手のユニットを1体選ぶ。
  // それの行動権がある場合、行動権を消費し1000ダメージを与える。
  // 行動権がない場合、それに5000ダメージを与える。
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    const filter = (unit: Unit) => unit.owner.id === opponent.id;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(
        stack,
        '神風の舞＆神託',
        '行動権を消費して1000ダメージ\nまたは5000ダメージ'
      );

      // 相手ユニットを1体選ぶ
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '効果対象を選択してください',
        1
      );
      if (target.active) {
        Effect.activate(stack, stack.processing, target, false);
        Effect.damage(stack, stack.processing, target, 1000, 'effect');
      } else {
        Effect.damage(stack, stack.processing, target, 5000, 'effect');
      }
    } else {
      await System.show(stack, '神託', '奇跡を発動すると【神託】は取り除かれる');
    }

    Effect.keyword(stack, stack.processing, stack.processing, '神託');
  },

  // 対戦相手のターン終了時、対戦相手の行動済ユニットを1体選ぶ。それを消滅させる。
  // このユニットの【神託】を取り除く。
  onTurnEnd: async (stack: StackWithCard<Unit>) => {
    if (!(stack.source.id === stack.processing.owner.opponent.id)) return;
    if (!stack.processing.hasKeyword('神託')) return;

    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    const filter = (unit: Unit) => unit.owner.id === opponent.id && !unit.active;

    if (EffectHelper.isUnitSelectable(stack.core, filter, owner)) {
      await System.show(stack, '奇跡・木漏れ日の福音', '行動済ユニット1体を消滅');
      // 相手ユニットを1体選ぶ
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        filter,
        '消滅させるユニットを選んでください',
        1
      );
      Effect.delete(stack, stack.processing, target);
      Effect.removeKeyword(stack, stack.processing, '神託');
    }
  },
};
