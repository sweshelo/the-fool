import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // あなたのターン開始時、対戦相手の紫ゲージを+1する
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    // 自分のターン開始時のみ発動
    if (stack.processing.owner.id !== stack.core.getTurnPlayer().id) return;

    const opponent = stack.processing.owner.opponent;

    await System.show(stack, '＜ウィルス・蝕＞', '紫ゲージ+1');
    await Effect.modifyPurple(stack, stack.processing, opponent, 1);
  },
};
