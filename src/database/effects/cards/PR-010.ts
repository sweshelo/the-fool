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
    if (!(stack.target instanceof Unit)) return;

    const isBeast = stack.target.catalog.species?.includes('獣') ?? false;

    if (isBeast) {
      // 獣ユニットの場合、基本BPを+3000
      await System.show(stack, '野生の衝動', '基本BP+3000');
      Effect.modifyBP(stack, stack.processing, stack.target, 3000, { isBaseBP: true });
    } else {
      // 獣以外のユニットの場合、獣ユニットを手札に加える
      await System.show(stack, '野生の衝動', '【獣】を手札に加える');
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '獣' });
    }
  },
};
