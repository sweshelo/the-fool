import { Player } from '@/package/core/class/Player';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 対戦相手のターン終了時、あなたはカードを1枚引く
  checkTurnEnd: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (!(stack.source instanceof Player)) return false;
    return stack.source.id === opponent.id;
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'シビュラの書', 'カードを1枚引く');
    await EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
