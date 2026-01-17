import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、対戦相手のフィールドに行動済ユニットがいる場合、このユニットに【スピードムーブ】を与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 相手の行動済ユニットがいる場合に発動
    if (opponent.field.some(unit => !unit.active)) {
      await System.show(stack, 'ティーガーチャージ', '【スピードムーブ】を得る');
      Effect.speedMove(stack, stack.processing);
    }
  },

  // このユニットがアタックした時、対戦相手の行動済ユニットを1体選ぶ。それに4000ダメージを与える。
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 対戦相手の行動済ユニットを選ぶ
    const filter = (unit: Unit) => unit.owner.id === owner.opponent.id && !unit.active;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, 'シュトゥルムファウスト', '行動済ユニットに4000ダメージ');
      const [target] = await EffectHelper.pickUnit(stack, owner, filter, '行動済ユニットを選択');

      if (target) {
        Effect.damage(stack, stack.processing, target, 4000);
      }
    }
  },
};
