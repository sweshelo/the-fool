import type { Stack } from '@/package/core/class/stack';
import type { Unit } from '@/package/core/class/card';
import { EffectHelper, System, Effect } from '..';

export const effects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: Stack) => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    const opponent = EffectHelper.opponent(stack.core, stack.processing);
    if (opponent.field.length <= 0) return;
    const damage = opponent.field.length * 1000;
    await System.show(stack, '破界炎舞・絶華繚乱', '相手フィールドのユニット数×1000ダメージ');

    const effect = (unit: Unit) => Effect.damage(stack, stack.processing!, unit, damage);
    EffectHelper.exceptSelf(stack.core, stack.processing as Unit, effect);
  },

  // 自身以外が召喚された時に発動する効果を記述
  // 味方ユニットであるかの判定などを忘れない
  onOverclockSelf: async (stack: Stack) => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    const opponent = EffectHelper.opponent(stack.core, stack.processing);
    const filter = (unit: Unit) => {
      return opponent.field.some(u => u.id === unit.id);
    };
    const units = EffectHelper.candidate(stack.core, filter);

    if (Array.isArray(units) && units.length > 0) {
      await System.show(stack, '破界炎舞・絶華繚乱', '10000ダメージ');
      const owner = EffectHelper.owner(stack.core, stack.processing);
      const [target] = await System.prompt(stack, owner.id, {
        title: 'ダメージを与えるユニットを選択',
        type: 'unit',
        items: units,
      });
      const unit = opponent.field.find(unit => unit.id === target);
      if (!unit) throw new Error('存在しないユニットが選択されました');
      Effect.damage(stack, stack.processing!, unit, 10000);
    }
  },
};
