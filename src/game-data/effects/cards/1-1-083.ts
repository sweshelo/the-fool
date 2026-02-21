import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '不屈＆不滅', 'ターン終了時に行動権を回復\nダメージを受けない');
    Effect.keyword(stack, stack.processing, stack.processing, '不屈');
    Effect.keyword(stack, stack.processing, stack.processing, '不滅');
  },
  onTurnEnd: async (stack: StackWithCard) => {
    await System.show(stack, '魂の代償', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner, -1);
  },
};
