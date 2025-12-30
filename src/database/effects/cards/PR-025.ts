import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // トリガー: あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    return stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
  },

  onDrive: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '巨竜の島', '【ドラゴン】を手札に加える');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: 'ドラゴン' });
  },

  // トリガー: あなたの【ドラゴン】ユニットが戦闘した時
  checkBattle: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      (stack.target.catalog.species?.includes('ドラゴン') ?? false)
    );
  },

  onBattle: async (stack: StackWithCard<Card>): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;

    await System.show(stack, '巨竜の島', 'BP+5000');
    Effect.modifyBP(stack, stack.processing, stack.target, 5000, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
