import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // トリガー条件のチェック
  checkDrive: (stack: StackWithCard) => {
    // フィールドに出たユニットが存在し、Unitのインスタンスであることを確認
    if (!stack.target || !(stack.target instanceof Unit)) {
      return false;
    }

    // 自分のユニットがフィールドに出た時のみ発動
    return stack.target.owner.id === stack.processing.owner.id;
  },

  // トリガー効果
  onDrive: async (stack: StackWithCard) => {
    if (!stack.target || !(stack.target instanceof Unit)) {
      return;
    }

    const target = stack.target;

    // 【神獣】ユニットがフィールドに出た時
    if (target.catalog.species?.includes('神獣')) {
      await System.show(stack, '神獣の住む秘境', '基本BP+2000\nブロックされない');
      Effect.modifyBP(stack, stack.processing, target, 2000, { isBaseBP: true });
      Effect.keyword(stack, stack.processing, target, '次元干渉', { cost: 0 });
    }
    // 【神獣】ユニット以外がフィールドに出た時
    else {
      await System.show(stack, '神獣の住む秘境', '【神獣】を手札に加える');
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '神獣' });
    }
  },
};
