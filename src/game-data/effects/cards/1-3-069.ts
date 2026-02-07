import { Unit, Card } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 対戦相手の効果によってあなたのユニットがダメージを受けた時
  checkDamage: (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    return (
      stack.source instanceof Card &&
      stack.source.owner.id === opponent.id &&
      stack.target instanceof Unit &&
      stack.target.owner.id === owner.id
    );
  },

  onDamage: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    await System.show(stack, 'バーンカウンター', 'BP+10000\nカードを1枚引く');
    // 全てのユニットのBPを+10000
    owner.field.forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, 10000, {
        event: 'turnEnd',
        count: 1,
      });
    });

    // カードを1枚引く
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
