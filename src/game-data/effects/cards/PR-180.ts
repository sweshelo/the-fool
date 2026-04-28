import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onIntercept: async (stack: StackWithCard<Unit>) => {
    if (stack.source.id !== stack.processing.owner.id) return;
    await System.show(stack, '紫電の溢力', '基本BP+2000');
    Effect.modifyBP(stack, stack.processing, stack.processing, 2000, { isBaseBP: true });
  },
  isBootable: (core, self) => {
    return (
      self.owner.hand.length < core.room.rule.player.max.hand &&
      self.owner.trash.some(card => card.catalog.type === 'intercept')
    );
  },
  onBootSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '起動・破滅の輪廻', '基本BP-3000\n捨札からインターセプトカードを回収');
    Effect.modifyBP(stack, stack.processing, stack.processing, -3000, { isBaseBP: true });
    EffectHelper.random(
      stack.processing.owner.trash.filter(card => card.catalog.type === 'intercept')
    ).forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
  },
};
