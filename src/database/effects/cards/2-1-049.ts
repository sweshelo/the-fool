import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

const summonUnitId = 'アトランティスナイト';

const condition = (stack: StackWithCard) =>
  stack.processing.owner.id !== stack.source.id && stack.processing.owner.field.length <= 4;
const effect = async (stack: StackWithCard) => {
  await System.show(stack, summonUnitId, `[${summonUnitId}] を【特殊召喚】`);
  await Effect.summon(stack, stack.processing, new Unit(stack.processing.owner, summonUnitId));
};

export const effects: CardEffects = {
  checkTurnEnd: condition,
  checkAttack: condition,
  onTurnEnd: effect,
  onAttack: effect,
};
