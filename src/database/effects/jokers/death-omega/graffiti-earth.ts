import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import type { CardEffects, StackWithCard } from '../../classes/types';
import { EffectTemplate } from '../../classes/templates';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  checkJoker: (_player, _core) => {
    return true;
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
