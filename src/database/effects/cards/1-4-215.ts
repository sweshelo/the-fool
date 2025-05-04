import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

const ability = async (stack: StackWithCard): Promise<void> => {
  const filter = (unit: Unit) => {
    return stack.processing.owner.opponent.field.some(u => u.id === unit.id);
  };
  const units = EffectHelper.candidate(stack.core, filter);

  if (Array.isArray(units) && units.length > 0) {
    await System.show(stack, '聖槍の瞬撃', '手札に戻す');
    const owner = stack.processing.owner;
    const [target] = await System.prompt(stack, owner.id, {
      title: '手札に戻すユニットを選択',
      type: 'unit',
      items: units,
    });
    const unit = stack.processing.owner.opponent.field.find(unit => unit.id === target);
    if (!unit) throw new Error('存在しないユニットが選択されました');
    Effect.bounce(stack, stack.processing, unit, 'hand');
  }
};

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await ability(stack);
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    // 対戦相手のターン開始時は、自フィールドに武身が4体以上いる場合に限る
    if (
      stack.processing.owner.id !== stack.core.getTurnPlayer().id &&
      stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('武身')).length < 4
    )
      return;
    await ability(stack);
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    if (
      stack.processing.owner.id === stack.core.getTurnPlayer().id ||
      !(stack.processing instanceof Unit)
    )
      return;
    await EffectTemplate.reincarnate(stack, stack.processing);
  },
};
