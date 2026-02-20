import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■冥界の門
  // あなたのユニットがフィールドに出た時、
  // 【不死】ユニットのカードを１枚ランダムで手札に加える。
  // あなたの【不死】ユニットが破壊された時、
  // 捨札にあるユニットカードをランダムで１枚手札に加える。

  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '冥界の門', '【不死】ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '不死' });
  },

  checkBreak: (stack: StackWithCard) => {
    return (
      stack.target instanceof Unit &&
      stack.target.catalog.species?.includes('不死') === true &&
      stack.processing.owner.id === stack.target.owner.id
    );
  },

  onBreak: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const unitCards = owner.trash.filter(card => card instanceof Unit);
    if (unitCards.length === 0) return;
    await System.show(stack, '冥界の門', '捨札から1枚回収');
    EffectHelper.random(unitCards, 1).forEach(unit =>
      Effect.move(stack, stack.processing, unit, 'hand')
    );
  },
};
