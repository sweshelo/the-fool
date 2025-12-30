import { Card, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■トリガー・クロック
  // 対戦相手のトリガーカードの効果が発動するたび
  checkTrigger: (stack: StackWithCard): boolean => {
    return (
      stack.source.id === stack.processing.owner.opponent.id &&
      stack.target instanceof Card &&
      stack.target.catalog.type === 'trigger'
    );
  },

  onTrigger: async (stack: StackWithCard): Promise<void> => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (candidates.length > 0) {
      await System.show(stack, 'トリガー・クロック', '敵ユニットのレベル+1');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidates,
        'レベルを上げるユニットを選択'
      );
      Effect.clock(stack, stack.processing, target, 1);
    }
  },

  // ■いっしょにいこうよ
  // このユニットが破壊された時
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targets = stack.processing.owner.opponent.field.filter(unit => unit.lv >= 2);

    if (targets.length > 0) {
      await System.show(stack, 'いっしょにいこうよ', '敵Lv2以上を全て破壊');
      targets.forEach(unit => {
        Effect.break(stack, stack.processing, unit);
      });
    }
  },
};
