import { Unit } from '@/package/core/class/card';
import type { Card } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■三日天下
  // あなたのユニットがフィールドに出た時、あなたの全てのユニットの基本BPを+3000し、【呪縛】を与える。
  checkDrive: (stack: StackWithCard) => {
    return stack.processing.owner.id === stack.source.id;
  },

  onDrive: async (stack: StackWithCard<Card>): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '三日天下', '味方全体の基本BP+3000\n【呪縛】を与える');

    owner.field.forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, 3000, { isBaseBP: true });
      Effect.keyword(stack, stack.processing, unit Unit, '呪縛');
    });
  },
};
