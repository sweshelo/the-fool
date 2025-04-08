import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { Card, Unit } from '@/package/core/class/card';
import { EffectHelper, System, Effect } from '..';

export const effects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: Stack, card: Card, core: Core) => {
    const opponent = EffectHelper.opponent(core, card);
    const damage = opponent.field.length * 1000;
    await System.show(
      stack,
      core,
      '破界炎舞・絶華繚乱',
      '相手フィールドのユニット数×1000ダメージ'
    );

    const effect = (unit: Unit) => Effect.damage(stack, core, card, unit, damage);
    EffectHelper.exceptSelf(core, card as Unit, effect);
  },

  // 自身以外が召喚された時に発動する効果を記述
  // 味方ユニットであるかの判定などを忘れない
  onOverclockSelf: async (stack: Stack, card: Card, core: Core) => {
    await System.show(stack, core, '破界炎舞・絶華繚乱', '10000ダメージ');
  },
};
