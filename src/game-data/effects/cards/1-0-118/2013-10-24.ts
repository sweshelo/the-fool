import { effect } from '@/game-data/effects/cards/1-0-118/_common';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkTurnStart: (stack: StackWithCard) => stack.processing.owner.id !== stack.source.id,
  onTurnStart: effect,
};
