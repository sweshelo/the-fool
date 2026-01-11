import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ユニットがフィールドに出た時: 所有者を問わない
  checkDrive: stack => stack.core.players.flatMap(player => player.field).length > 0,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'キングオブキングス', '1000ダメージ×5回');
    EffectHelper.repeat(5, () => {
      const [target] = EffectHelper.random(stack.core.players.flatMap(player => player.field));
      if (target) Effect.damage(stack, stack.processing, target, 1000);
    });
  },
};
