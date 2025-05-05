import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '地裂地轟', '【貫通】\nCP+[コスト×1]\n【攻撃禁止】を与える');
    Effect.keyword(stack, stack.processing, stack.processing as Unit, '貫通');
    EffectHelper.random(stack.processing.owner.opponent.field, 2).forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '攻撃禁止', {
        event: 'turnEnd',
        count: 1,
        onlyForOwnersTurn: true,
      });
      Effect.modifyCP(stack, stack.processing, stack.processing.owner, unit.catalog.cost);
    });
  },
};
