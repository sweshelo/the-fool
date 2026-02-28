import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) =>
    stack.processing.owner.id === stack.source.id &&
    stack.target instanceof Unit &&
    stack.target.catalog.cost >= 5,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'LIVEラリー', '[LIVEラリー]を作成\n対戦相手のトリガーゾーンにセット');
    Effect.make(stack, stack.processing.owner, '2-3-231', 'trigger');
  },
  checkTurnEnd: (stack: StackWithCard) => {
    return stack.source.id === stack.processing.owner.id;
  },
  onTurnEnd: async (stack: StackWithCard) => {
    await System.show(stack, 'LIVEラリー', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner, -1);
  },
};
