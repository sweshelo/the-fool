import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(
      stack,
      '貫通＆不屈',
      'ブロックを貫通してプレイヤーにダメージを与える\nターン終了時に行動権を回復'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '不屈');
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
  },

  onOverclockSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.opponent.field.length === 0) return;
    await System.show(stack, 'オーラブレード', '敵全体の基本BP-3000');
    stack.processing.owner.opponent.field.forEach(unit =>
      Effect.modifyBP(stack, stack.processing, unit, -3000, { isBaseBP: true })
    );
  },
};
