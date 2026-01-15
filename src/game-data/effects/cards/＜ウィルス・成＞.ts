import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのターン終了時、このユニット以外のあなたのユニットからランダムで1体のレベルを+1する
  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    // 自分のターン終了時のみ発動
    if (stack.processing.owner.id !== stack.core.getTurnPlayer().id) return;

    const targets = stack.processing.owner.field.filter(unit => unit.id !== stack.processing.id);

    if (targets.length > 0) {
      await System.show(stack, '＜ウィルス・成＞', 'レベル+1');
      EffectHelper.random(targets, 1).forEach(target =>
        Effect.clock(stack, stack.processing, target, 1)
      );
    }
  },
};
