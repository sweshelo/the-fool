import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // トリガー: 対戦相手のターン時、あなたの【舞姫】ユニットが効果によって破壊された時
  checkBreak: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.core.getTurnPlayer().id === stack.processing.owner.opponent.id &&
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      (stack.target.catalog.species?.includes('舞姫') ?? false) &&
      stack.option?.type === 'break' &&
      stack.option.cause !== 'battle'
    );
  },

  onBreak: async (stack: StackWithCard<Card>): Promise<void> => {
    const targets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (targets.length > 0) {
      await System.show(stack, '巫女の護り手', 'ユニットを破壊');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        targets,
        '破壊するユニットを選択'
      );

      Effect.break(stack, stack.processing, target);
    }
  },
};
