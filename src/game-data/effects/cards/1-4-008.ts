import type { Unit } from '@/package/core/class/card';
import { EffectHelper, System, Effect } from '..';
import type { StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const opponent = stack.processing.owner.opponent;
    if (opponent.field.length <= 0) return;
    const damage = opponent.field.length * 1000;
    await System.show(stack, '破界炎舞・絶華繚乱', '相手フィールドのユニット数×1000ダメージ');

    const effect = (unit: Unit) => Effect.damage(stack, stack.processing, unit, damage);
    EffectHelper.exceptSelf(stack.core, stack.processing, effect);
  },

  // 自身がオーバークロックした時に発動する効果を記述
  onOverclockSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) return;

    await System.show(stack, '破界炎舞・絶華繚乱', '10000ダメージ');
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '10000ダメージを与えるユニットを選択',
      1
    );
    Effect.damage(stack, stack.processing, target, 10000);
  },

  // アタック時：あなたの【神】ユニット1体につき自身のBP+2000（ターン終了時まで）
  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const godCount = owner.field.filter(unit => unit.catalog.species?.includes('神')).length;
    if (godCount <= 0) return;
    const bpBoost = godCount * 2000;
    await System.show(stack, '破界炎舞・絶華繚乱', `BP+[【神】×2000]`);
    Effect.modifyBP(stack, stack.processing, stack.processing, bpBoost, {
      event: 'turnEnd',
      count: 1,
    });
  },

  // 手札効果：自分の赤のユニットが場にいる場合、このユニットのコスト-1
  handEffect: (core: unknown, self: Unit) => {
    PermanentEffect.mount(self, {
      effect: (target, source) => Effect.modifyCost(target, -1, { source }),
      effectCode: '破界炎舞・絶華繚乱',
      targets: ['self'],
      condition: target => target.owner.field.some(unit => unit.catalog.color === Color.RED),
    });
  },
};
