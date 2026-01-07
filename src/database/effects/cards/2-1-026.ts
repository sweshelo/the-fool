import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const filter = (unit: Unit) =>
      unit.owner.id !== stack.processing.owner.id && unit.catalog.cost <= 2;
    if (
      stack.processing.owner.purple &&
      stack.processing.owner.purple >= 3 &&
      EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
    ) {
      await System.show(stack, 'リボーン・オブ・ナイル', 'コスト2以下を【複製】し消滅');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '【複製】し消滅させるユニットを選択',
        1
      );
      await Effect.clone(stack, stack.processing, target, stack.processing.owner);
      Effect.delete(stack, stack.processing, target);
    }
  },

  onIntercept: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.id === stack.source.id && stack.processing.owner.hand.length > 0) {
      await System.show(
        stack,
        'ギフト・オブ・ウアス',
        '手札を1枚捨てる\nカードを1枚引く\n【沈黙】を得る'
      );
      const [target] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        stack.processing.owner.hand,
        '捨てるカードを選択して下さい',
        1
      );
      Effect.handes(stack, stack.processing, target);
      EffectTemplate.draw(stack.processing.owner, stack.core);
      Effect.keyword(stack, stack.processing, stack.processing, '沈黙', {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
