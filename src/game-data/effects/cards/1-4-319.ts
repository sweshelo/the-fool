import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '援軍／英雄', '【英雄】ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '英雄' });
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      stack.target.catalog.cost >= 2 &&
      stack.target.catalog.species?.includes('英雄') &&
      stack.target !== stack.processing
    ) {
      await System.show(stack, '勇者への祈り', '【撤退禁止】を与える\nCP+1');
      Effect.keyword(stack, stack.processing, stack.target, '撤退禁止', {
        event: 'turnEnd',
        count: 1,
      });
      Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
    }
  },
};
