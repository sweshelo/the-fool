import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 【神託】
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;

    await System.show(stack, '神託', '奇跡を発動すると【神託】は取り除かれる');
    Effect.keyword(stack, self, self, '神託');
  },

  // ■奇跡・ハイウェイト
  // このユニットがアタックした時、このユニットに【神託】がある場合、対戦相手のユニットを2体まで選ぶ。それらの行動権を消費する。このユニットの【神託】を取り除く。
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;

    // 【神託】がない場合は発動しない
    if (!self.hasKeyword('神託')) return;

    // 対戦相手のフィールドにユニットがいない場合は発動しない
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) return;

    await System.show(stack, '奇跡・ハイウェイト', '行動権を消費');

    // 対戦相手のユニットを2体まで選ぶ
    const targets = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '行動権を消費するユニットを選択',
      2
    );

    // 選択したユニットの行動権を消費
    for (const target of targets) {
      Effect.activate(stack, self, target, false);
    }

    // 【神託】を取り除く
    Effect.removeKeyword(stack, self, '神託');
  },
};
