import { System } from '../../engine/system';
import { EffectTemplate } from '../../engine/templates';
import type { CardEffects, StackWithCard } from '../../schema/types';

export const effects: CardEffects = {
  checkJoker: (_player, _core) => {
    return true;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    // 手札が7枚以上ある場合は発動しない
    if (owner.hand.length >= 7) return;

    await System.show(stack, 'ワンダフルハンド', '手札が7枚になるまでカードを引く');

    // 手札が7枚になるまでカードを引く
    const drawCount = 7 - owner.hand.length;
    for (let i = 0; i < drawCount; i++) {
      EffectTemplate.draw(owner, stack.core);
    }
  },
};
