import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '不屈', 'ターン終了時に行動権を回復');
    Effect.keyword(stack, stack.processing, stack.processing, '不屈');
  },

  onTurnStart: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.id !== stack.source.id) return;
    await System.show(stack, 'グロウアップ', '基本BP+1000');
    Effect.modifyBP(stack, stack.processing, stack.processing, 1000, { isBaseBP: true });
  },

  onBlockSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'オーバーフロー', 'CP-3');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner.opponent, -3);
  },
};
