import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.processing.owner.field.length > 0 &&
    stack.processing.owner.opponent.field.length > 0 &&
    stack.processing.owner.id === stack.source.id,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '両成敗', 'お互いの最高BPユニットを消滅');
    stack.core.players.forEach(player => {
      const max = Math.max(...player.field.map(unit => unit.currentBP));
      const candidate = player.field.filter(unit => unit.currentBP === max);
      EffectHelper.random(candidate).forEach(unit => Effect.delete(stack, stack.processing, unit));
    });
  },
};
