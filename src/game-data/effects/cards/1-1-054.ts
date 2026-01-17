import { EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, '援軍／ドラゴン', '【ドラゴン】ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: 'ドラゴン' });
  },

  onBreakSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const dragonUnits = owner.hand.filter(
      card => card.catalog.type === 'unit' && card.catalog.species?.includes('ドラゴン')
    );

    if (dragonUnits.length > 0) {
      await System.show(stack, '繋がれる竜の血', '【ドラゴン】ユニットのコスト-1');
      const selectedCard = EffectHelper.random(dragonUnits, 1)[0];
      if (selectedCard) {
        selectedCard.delta.push(new Delta({ type: 'cost', value: -1 }));
      }
    }
  },
};
