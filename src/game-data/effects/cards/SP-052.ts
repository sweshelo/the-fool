import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkTurnStart: (stack: StackWithCard) =>
    stack.source.id === stack.processing.owner.id &&
    EffectHelper.isUnitSelectable(stack.core, 'owns', stack.processing.owner),
  onTurnStart: async (stack: StackWithCard) => {
    await System.show(stack, '自然の声', '基本BP-5000\nカードを1枚引く');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'owns',
      '基本BPを-するユニットを選択'
    );
    Effect.modifyBP(stack, stack.processing, target, -5000, { isBaseBP: true });
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
