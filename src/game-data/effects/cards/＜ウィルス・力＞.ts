import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのターン終了時、対戦相手のユニットからランダムで1体の基本BPを+2000する
  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    // 自分のターン終了時のみ発動
    if (stack.processing.owner.id !== stack.core.getTurnPlayer().id) return;

    const opponent = stack.processing.owner.opponent;

    if (opponent.field.length > 0) {
      await System.show(stack, '＜ウィルス・力＞', '基本BP+2000');
      EffectHelper.random(opponent.field, 1).forEach(target =>
        Effect.modifyBP(stack, stack.processing, target, 2000, { isBaseBP: true })
      );
    }
  },
};
