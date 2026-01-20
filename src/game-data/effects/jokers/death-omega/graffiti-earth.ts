import { System } from '../../engine/system';
import { EffectHelper } from '../../engine/helper';
import type { CardEffects, StackWithCard } from '../../schema/types';
import { EffectTemplate } from '../../engine/templates';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return player.hand.length < core.room.rule.player.max.hand;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'グラフィティ・アース', 'カードを3枚引く\nコスト-1');
    EffectHelper.repeat(3, () => {
      const target = EffectTemplate.draw(stack.processing.owner, stack.core);
      if (target) {
        target.delta.push(new Delta({ type: 'cost', value: -1 }));
      }
    });
  },
};
