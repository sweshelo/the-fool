import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit)) throw new Error('不正なタイプが指定されました');

    if (stack.processing.owner.field.length <= 4) {
      await System.show(stack, 'ドッペルバース＆攻撃禁止', '自身を複製\nアタックできない');
      Effect.keyword(stack, stack.processing, stack.processing, '攻撃禁止');
      await Effect.clone(stack, stack.processing, stack.processing, stack.processing.owner);
    } else {
      await System.show(stack, '攻撃禁止', 'アタックできない');
      Effect.keyword(stack, stack.processing, stack.processing, '攻撃禁止');
    }
  },

  onBreakSelf: async (stack: StackWithCard): Promise<void> => {
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, 'ビートルクラッシュ', '1000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択してください'
      );
      Effect.damage(stack, stack.processing, target, 1000, 'effect');
    }
  },
};
