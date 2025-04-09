import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { Card, Unit } from '@/package/core/class/card';
import { EffectHelper, System, Effect } from '..';

export const effects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: Stack, card: Card, core: Core) => {
    const opponent = EffectHelper.opponent(core, card);
    if (opponent.field.length <= 0) return;
    const damage = opponent.field.length * 1000;
    await System.show(
      stack,
      core,
      '破界炎舞・絶華繚乱',
      '相手フィールドのユニット数×1000ダメージ',
      card
    );

    const effect = (unit: Unit) => Effect.damage(stack, core, card, unit, damage);
    EffectHelper.exceptSelf(core, card as Unit, effect);
  },

  // 自身以外が召喚された時に発動する効果を記述
  // 味方ユニットであるかの判定などを忘れない
  onOverclockSelf: async (stack: Stack, card: Card, core: Core) => {
    const opponent = EffectHelper.opponent(core, card);
    const filter = (unit: Unit) => {
      return opponent.field.some(u => u.id === unit.id);
    };
    const units = EffectHelper.candidate(core, filter);

    if (Array.isArray(units) && units.length > 0) {
      await System.show(stack, core, '破界炎舞・絶華繚乱', '10000ダメージ', card);
      const [target] = await System.prompt(stack, core, EffectHelper.owner(core, card).id, {
        title: 'ダメージを与えるユニットを選択',
        type: 'unit',
        items: units,
      });
      const unit = opponent.field.find(unit => unit.id === target);
      if (!unit) throw new Error('存在しないユニットが選択されました');
      Effect.damage(stack, core, card, unit, 10000);
    }
  },
};
