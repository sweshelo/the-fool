import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットが戦闘した時、それがアタック中だった場合
  checkBattle: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    if (!(stack.source instanceof Unit)) return false;
    if (stack.source.owner.id !== owner.id) return false;

    // ユニットが存在し、フィールドにまだいる場合のみ発動
    return stack.source.lv < 3 && owner.field.some(unit => unit.id === stack.source.id);
  },

  onBattle: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.source instanceof Unit)) return;

    await System.show(stack, '熱き青春', 'レベル+1');
    Effect.clock(stack, stack.processing, stack.source, 1);
  },
};
