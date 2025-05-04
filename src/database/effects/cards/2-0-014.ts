import { Color } from '@/submodule/suit/constant/color';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onTurnStartInTrash: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit))
      throw new Error('Unitではないオブジェクトが指定されました');

    const isOpponentTurn = stack.processing.owner.id !== stack.core.getTurnPlayer().id;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isAtLeast15BlueCardsInTrash =
      stack.processing.owner.trash.filter(card => card.catalog.color === Color.BLUE).length >= 15;

    if (isOpponentTurn) {
      await System.show(stack, 'ミーナ頑張る！', '【特殊召喚】');
      Effect.summon(stack, stack.processing, stack.processing);
    }
  },
};
