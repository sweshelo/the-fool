import { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

const effect = async (stack: StackWithCard) => {
  await System.show(stack, '侵撃の魔手', '手札を1枚選んで捨てる');
  const [target] = await EffectHelper.selectCard(
    stack,
    stack.processing.owner.opponent,
    stack.processing.owner.opponent.hand,
    '捨てるカードを選んで下さい'
  );
  Effect.break(stack, stack.processing, target);
};

export const effects: CardEffects = {
  checkTurnEnd: (stack: StackWithCard) => {
    return (
      stack.processing.owner.opponent.hand.length > 0 &&
      stack.processing.owner.id !== stack.source.id
    );
  },

  checkPlayerAttack: (stack: StackWithCard) => {
    return stack.source instanceof Unit && stack.processing.owner.id === stack.source.owner.id;
  },

  onTurnEnd: effect,
  onPlayerAttack: effect,
};
