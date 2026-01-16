import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing instanceof Unit) {
      await System.show(
        stack,
        '転元超破',
        '【次元干渉／コスト3】\n【スピードムーブ】\n可能なら即時アタックする'
      );
      Effect.keyword(stack, stack.processing, stack.processing, '次元干渉', { cost: 3 });
      Effect.speedMove(stack, stack.processing);

      if (stack.core.turn !== 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await stack.core.attack(stack.processing, stack);
      }
    }
  },

  onOverclockSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.opponent.field.length > 0) {
      await System.show(stack, '裁きの光翼', '最高BPユニットを消滅');
      const max = Math.max(...stack.processing.owner.opponent.field.map(unit => unit.currentBP));
      const candidate = stack.processing.owner.opponent.field.filter(
        unit => unit.currentBP === max
      );

      EffectHelper.random(candidate).forEach(unit => Effect.delete(stack, stack.processing, unit));
    }
  },
};
