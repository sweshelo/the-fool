import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const choice = await EffectHelper.choice(stack, stack.processing.owner, '選略・ツインロード', [
      { id: '1', description: '【無我の境地】を得る' },
      { id: '2', description: '【消滅効果耐性】を得る' },
    ]);
    switch (choice) {
      case '1': {
        await System.show(stack, '選略・ツインロード', '【無我の境地】を得る');
        Effect.keyword(stack, stack.processing, stack.processing, '無我の境地');
        break;
      }
      case '2': {
        await System.show(stack, '選略・ツインロード', '【消滅効果耐性】を得る');
        Effect.keyword(stack, stack.processing, stack.processing, '消滅効果耐性');
        break;
      }
    }
  },
};
