import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.processing.owner.field.length > 0 && stack.processing.owner.opponent.field.length > 0,

  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '両成敗', 'お互いの最高BPユニットを消滅');
    stack.core.players.forEach(player => {
      const max = Math.max(...player.field.map(unit => unit.currentBP));
      const candidate = player.field.filter(unit => unit.currentBP === max);
      EffectHelper.random(candidate).forEach(unit => Effect.delete(stack, stack.processing, unit));
    });
  },
};
