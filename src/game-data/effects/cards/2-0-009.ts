import { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;

    await System.show(stack, '神託', '奇跡を発動すると【神託】は取り除かれる');
    Effect.keyword(stack, self, self, '神託');
  },

  onPlayerAttack: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;

    // 【神託】がない場合は発動しない
    if (!self.hasKeyword('神託') || stack.target?.id !== stack.processing.owner.id) return;

    await System.show(stack, '奇跡・癒しの恵み', 'ライフ+1');

    // ライフを+1する
    Effect.modifyLife(stack, stack.processing, self.owner, 1);

    // 【神託】を取り除く
    Effect.removeKeyword(stack, self, '神託');
  },
};
