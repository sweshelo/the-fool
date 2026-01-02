import { System } from '../classes/system';
import { EffectHelper } from '../classes/helper';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Effect } from '../classes/effect';
import { EffectTemplate } from '../classes/templates';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    return EffectHelper.hasGauge(player, '大');
  },

  onJokerSelf: async (stack: StackWithCard) => {
    Effect.modifyJokerGauge(stack, stack.processing, stack.processing.owner, '大');

    await System.show(stack, 'グラフィティ・アース', 'カードを3枚引く\nコスト-1');
    EffectHelper.repeat(3, () => {
      const target = EffectTemplate.draw(stack.processing.owner, stack.core);
      if (target) {
        target.delta.push(new Delta({ type: 'cost', value: -1 }));
      }
    });
  },
};
