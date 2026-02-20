import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットが戦闘によって破壊された時
  checkBreak(stack: StackWithCard): boolean {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (!(stack.target instanceof Unit)) return false;
    if (!(stack.source instanceof Unit)) return false;

    return (
      stack.target.owner.id === owner.id &&
      stack.option?.type === 'break' &&
      stack.option.cause === 'battle' &&
      opponent.field.some(unit => unit.id === stack.source.id)
    );
  },

  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (!(stack.source instanceof Unit)) return;

    // 戦闘中の相手ユニットを破壊する
    await System.show(stack, '道連れ', '戦闘中の相手ユニットを破壊\n相手はカードを1枚引く');
    Effect.break(stack, stack.processing, stack.source);

    // 対戦相手はカードを1枚引く
    EffectTemplate.draw(opponent, stack.core);
  },
};
