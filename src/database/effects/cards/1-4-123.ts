import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';

const getCheckFunction = (cost: number) => {
  return async (stack: StackWithCard) => {
    return !!stack.processing.owner.trash.find(unit => unit.catalog.cost <= cost) &&
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.core.getTurnPlayer().id !== stack.processing.owner.id &&
      stack.option?.type === 'break'
      ? stack.option.cause !== 'battle'
      : true && stack.processing.owner.field.length <= stack.core.room.rule.player.max.field;
  };
};

const getSummonFunction = (cost: number) => {
  return async (stack: StackWithCard) => {
    const [target] = EffectHelper.random(
      stack.processing.owner.trash.filter(unit => unit.catalog.cost <= cost)
    );
    if (!(target instanceof Unit)) throw new Error('1-4-123: 不正なTarget');
    await System.show(stack, "It's showtime", `コスト${cost}以下を【特殊召喚】`);
    await Effect.summon(stack, stack.processing, target);
  };
};

export const effects: CardEffects = {
  checkBreak: getCheckFunction(1),
  checkDelete: getCheckFunction(3),
  checkBounce: getCheckFunction(5),
  onBreak: getSummonFunction(1),
  onDelete: getSummonFunction(3),
  onBounce: getSummonFunction(5),
};
