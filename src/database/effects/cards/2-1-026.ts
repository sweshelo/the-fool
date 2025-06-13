import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id && unit.catalog.cost <= 2,
      stack.processing.owner
    );
    if (
      stack.processing.owner.purple &&
      stack.processing.owner.purple >= 3 &&
      candidate.length > 0
    ) {
      await System.show(stack, 'リボーン・オブ・ナイル', 'コスト2以下を【複製】し消滅');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidate,
        '【複製】し消滅させるユニットを選択',
        1
      );
      Effect.clone(stack, stack.processing, target, stack.processing.owner);
      Effect.delete(stack, stack.processing, target);
    }
  },

  onIntercept: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.id === stack.source.id && stack.processing.owner.hand.length > 0) {
      await System.show(stack, 'ギフト・オブ・ウアス', '手札を1枚捨てる\nカードを1枚引く');
      const [target] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        stack.processing.owner.hand,
        '捨てるカードを選択して下さい',
        1
      );
      Effect.handes(stack, stack.processing, target);
      EffectTemplate.draw(stack.processing.owner, stack.core);
    }
  },
};
