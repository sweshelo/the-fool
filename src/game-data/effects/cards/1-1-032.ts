import type { Card } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットが戦闘した時、ターン終了時まであなたの全ての【悪魔】ユニットのBPを+3000する。
  checkBattle: (stack: StackWithCard<Card>): boolean => {
    const owner = stack.processing.owner;

    // 自分のフィールドに【悪魔】ユニットが存在するか
    return owner.field.some(unit => unit.catalog.species?.includes('悪魔'));
  },

  onBattle: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '威圧', '【悪魔】のBP+3000');

    // 自分のフィールドの全ての【悪魔】ユニットにBP+3000を付与
    owner.field
      .filter(unit => unit.catalog.species?.includes('悪魔'))
      .forEach(unit =>
        Effect.modifyBP(stack, stack.processing, unit, 3000, {
          event: 'turnEnd',
          count: 1,
        })
      );
  },
};
