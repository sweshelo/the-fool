import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';

const getCheckFunction = (cost: number) => {
  return async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const target = stack.target;
    if (!(target && target instanceof Unit)) return false;

    return (
      !!owner.trash.find(
        unit => unit instanceof Unit && unit.catalog.type === 'unit' && unit.catalog.cost <= cost
      ) &&
      target.owner.id === owner.id &&
      stack.core.getTurnPlayer().id !== owner.id &&
      owner.field.length < stack.core.room.rule.player.max.field &&
      (stack.option?.type !== 'break' || EffectHelper.isBreakByEffect(stack)) &&
      (stack.option?.type !== 'bounce' || target.leaving?.destination === 'hand')
    );
  };
};

const getSummonFunction = (cost: number) => {
  return async (stack: StackWithCard) => {
    const [target] = EffectHelper.random(
      stack.processing.owner.trash.filter(
        card => card instanceof Unit && card.catalog.type === 'unit' && card.catalog.cost <= cost
      )
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
