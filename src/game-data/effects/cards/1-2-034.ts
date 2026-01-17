import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■死への誘惑
  // 対戦相手のターン終了時
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 相手のターン終了時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      return;
    }

    const targets = [
      ...stack.processing.owner.field,
      ...stack.processing.owner.opponent.field,
    ].filter(unit => unit.lv >= 2);

    if (targets.length > 0) {
      await System.show(stack, '死への誘惑', 'Lv2以上のユニットを全て破壊');
      targets.forEach(unit => {
        Effect.break(stack, stack.processing, unit);
      });
    }
  },

  // ■死への誘い
  // このユニットが破壊された時
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const triggerZone = stack.processing.owner.opponent.trigger;

    if (triggerZone.length > 0) {
      await System.show(stack, '死への誘い', 'トリガーゾーンのカードを1枚破壊');
      const [target] = EffectHelper.random(triggerZone, 1);
      if (target) {
        Effect.move(stack, stack.processing, target, 'trash');
      }
    }
  },
};
