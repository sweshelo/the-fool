import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  checkBattle: () => true,

  onBattle: async (stack: StackWithCard) => {
    // 戦闘中の自ユニットを特定
    const [target] = [stack.source, stack.target].filter(
      (object): object is Unit =>
        object instanceof Unit && object.owner.id === stack.processing.owner.id
    );
    if (!target) return;

    await System.show(stack, '不可侵防壁', 'BP+3000');
    Effect.modifyBP(stack, stack.processing, target, 3000, { event: 'turnEnd', count: 1 });
  },
};
