import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // ■忍術指南
  // このユニットがフィールドに出た時、あなたの【忍者】ユニットを1体選ぶ。それのレベルを+1する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のフィールドに【忍者】ユニットがいるか確認
    const ninjaFilter = (unit: Unit) =>
      unit.owner.id === owner.id && unit.catalog.species?.includes('忍者');

    if (!EffectHelper.isUnitSelectable(stack.core, ninjaFilter, owner)) return;

    await System.show(stack, '忍術指南', '【忍者】のレベル+1');

    // 【忍者】ユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      ninjaFilter,
      'レベルを+1する【忍者】ユニットを選択'
    );

    // レベルを+1する
    Effect.clock(stack, stack.processing, target, 1);
  },

  // ■忍法・木遁の術
  // あなたのレベル3以上の【忍者】ユニットに【次元干渉／コスト3】を与える。
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns'],
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.keyword(stack, stack.processing, unit, '次元干渉', { source, cost: 3 });
        }
      },
      effectCode: '忍法・木遁の術',
      condition: target => target.catalog.species?.includes('忍者') === true && target.lv >= 3,
    });
  },
};
