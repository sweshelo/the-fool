import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのターン終了時、このユニット以外のあなたのユニットからランダムで1体の行動権を消費する
  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    // 自分のターン終了時のみ発動
    if (stack.processing.owner.id !== stack.core.getTurnPlayer().id) return;

    const targets = stack.processing.owner.field.filter(unit => unit.id !== stack.processing.id);

    if (targets.length > 0) {
      await System.show(stack, '＜ウィルス・費＞', '行動権を消費');
      EffectHelper.random(targets, 1).forEach(target =>
        Effect.activate(stack, stack.processing, target, false)
      );
    }
  },
};
