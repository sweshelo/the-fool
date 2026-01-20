import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // ■大天使の加護
  // このユニットがフィールドに出た時、あなたの全てのユニットの行動権を回復する。
  // ■サポーター／天使
  // あなたの【天使】ユニットのBPを+1000する。

  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '大天使の加護', '味方全体の行動権を回復\n【天使】のBPを+1000');

    // 自分の全てのユニットの行動権を回復
    for (const unit of owner.field) {
      Effect.activate(stack, stack.processing, unit, true);
    }
  },

  // フィールド効果：天使ユニットのBPを+1000する
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack, stack.processing, {
      targets: ['owns'],
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, unit, 1000, { source });
        }
      },
      effectCode: 'サポーター／天使',
      condition: target => target.catalog.species?.includes('天使') ?? false,
    });
  },
};
