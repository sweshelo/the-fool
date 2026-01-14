import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // このユニットが破壊された時、対戦相手のユニットを1体選ぶ。それのレベルを3にする。
  // この効果によってオーバークロックしたユニットはオーバークロック時の効果を発動できない。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, 'クロックトリック', 'レベルを3にする');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'レベルを3にするユニットを選択'
      );

      if (target) {
        Effect.clock(stack, stack.processing, target, 2, true);
      }
    }
  },

  // このユニットがオーバークロックした時、あなたの捨札にあるインターセプトカードを1枚ランダムで手札に加える。
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const intercepts = owner.trash.filter(card => card.catalog.type === 'intercept');
    if (intercepts.length > 0 && owner.hand.length < stack.core.room.rule.player.max.hand) {
      await System.show(stack, 'コレクトトリック', 'インターセプトカードを回収');
      const [card] = EffectHelper.random(intercepts, 1);
      if (card) Effect.move(stack, stack.processing, card, 'hand');
    }
  },
};
