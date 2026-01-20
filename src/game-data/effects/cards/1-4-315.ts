import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    if (opponent.hand.length === 0) return;

    await System.show(stack, 'だてんしのいたずら', '手札を2枚まで捨てる');

    // 相手に手札を2枚まで選択させて捨てる
    const selectedCards = await EffectHelper.selectCard(
      stack,
      opponent,
      opponent.hand,
      '捨てるカードを選択してください',
      Math.min(2, stack.processing.owner.opponent.hand.length)
    );

    for (const card of selectedCards) {
      Effect.handes(stack, stack.processing, card);
    }
  },

  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    if (opponent.trigger.length === 0) return;

    // トリガーゾーンからランダムで1枚選ぶ
    const [target] = EffectHelper.random(opponent.trigger, 1);
    if (!target) return;

    await System.show(stack, 'えんじぇりっく・ろすと', 'トリガーゾーンを1枚破壊');
    Effect.move(stack, stack.processing, target, 'trash');
  },
};
