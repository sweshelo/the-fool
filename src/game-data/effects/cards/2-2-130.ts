import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: stack => stack.processing.owner.id === stack.source.id,
  checkTurnEnd: stack => stack.processing.owner.id === stack.source.id,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '謎の来訪者', '消滅カードを1枚回収');
    EffectHelper.random(stack.processing.owner.delete).forEach(card =>
      Effect.move(stack, stack.processing, card, 'hand')
    );
  },
  onTurnEnd: async (stack: StackWithCard) => {
    await System.show(stack, '謎の来訪者', '消滅カードを2枚回収');
    EffectHelper.random(stack.processing.owner.delete, 2).forEach(card =>
      Effect.move(stack, stack.processing, card, 'hand')
    );
  },
};
