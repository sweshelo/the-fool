import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  checkBattle: stack => stack.processing.owner.trigger.length > 0,
  onBattle: async (stack: StackWithCard) => {
    // 戦闘中の自ユニットを特定
    const [target] = [stack.source, stack.target].filter(
      (object): object is Unit =>
        object instanceof Unit && object.owner.id === stack.processing.owner.id
    );
    if (!target) return;

    await System.show(stack, '潜在解放', 'BP+5000');
    Effect.modifyBP(stack, stack.processing, target, 5000, { event: 'turnEnd', count: 1 });
  },
};
