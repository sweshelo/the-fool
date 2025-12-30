import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■聖海の守護竜
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.field.length <= 4) {
      await System.show(stack, '聖海の守護竜', '[ヴォジャノーイ]を2体まで【特殊召喚】');

      // レベル2のヴォジャノーイを召喚
      const lv2Unit = new Unit(stack.processing.owner, '1-2-038');
      lv2Unit.lv = 2; // クロックアップ効果をバイパスし、処理させないので直接代入する
      await Effect.summon(stack, stack.processing, lv2Unit);

      // フィールドが5体未満であれば、レベル1のヴォジャノーイも召喚
      if (stack.processing.owner.field.length < 5) {
        const lv1Unit = new Unit(stack.processing.owner, '1-2-038');
        Effect.clock(stack, stack.processing, lv1Unit, 1);
        await Effect.summon(stack, stack.processing, lv1Unit);
      }
    }
  },

  // ■鎖海の潮流
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.field.length <= 4) {
      await System.show(stack, '鎖海の潮流', '[ヴォジャノーイ]を【特殊召喚】');

      const unit = new Unit(stack.processing.owner, '1-2-038');
      await Effect.summon(stack, stack.processing, unit);
    }
  },
};
