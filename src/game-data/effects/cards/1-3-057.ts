import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkTurnStart: (stack: StackWithCard) =>
    stack.source.id === stack.processing.owner.id && stack.processing.owner.delete.length > 0,
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '神札再生', '消滅から1枚回収');
    const [target] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      stack.processing.owner.delete,
      '手札に加えるカードを選択'
    );
    // 手札が上限に達している場合、消滅から捨札に送られる
    Effect.move(stack, stack.processing, target, 'hand');
  },
};
