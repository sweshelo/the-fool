import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '黙滅の烏羽', '【沈黙】を与える');
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '【沈黙】を与えるユニットを選択'
    );
    Effect.keyword(stack, stack.processing, target, '沈黙');
  },

  onBreakSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '蒼き渡り鴉', '捨札から【盗賊】を1枚回収');
    EffectHelper.random(
      stack.processing.owner.trash.filter(card => card.catalog.species?.includes('盗賊')),
      1
    ).forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
  },
};
