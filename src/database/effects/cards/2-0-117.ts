import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // ユニット: ウィークネス＆ドロー
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (targets.length > 0) {
      await System.show(stack, 'ウィークネス＆ドロー', '基本BP-5000\nカードを1枚引く');

      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        targets,
        '基本BPを下げるユニットを選択'
      );

      Effect.modifyBP(stack, stack.processing, target, -5000, { isBaseBP: true });
      EffectTemplate.draw(stack.processing.owner, stack.core);
    }
  },
};
