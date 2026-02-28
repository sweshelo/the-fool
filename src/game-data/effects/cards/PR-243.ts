import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkTurnStart: (stack: StackWithCard) => {
    return stack.source.id === stack.processing.owner.opponent.id;
  },

  onTurnStart: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(
      stack,
      '時の妖精フォロン',
      'コスト2以下のユニットを出せない\nジョーカーゲージ-20%\nCP+2\nトリガーカードを1枚引く'
    );

    // 対戦相手の手札にあるコスト2以下のユニットを使用不能に
    opponent.hand
      .filter(unit => unit instanceof Unit && unit.catalog.cost <= 2)
      .forEach(unit => Effect.ban(stack, stack.processing, unit, { event: 'turnEnd', count: 1 }));

    // ジョーカーゲージを20%減少させる
    Effect.modifyJokerGauge(stack, stack.processing, owner, -20);

    // CPを+2
    Effect.modifyCP(stack, stack.processing, owner, 2);

    // トリガーカードを1枚引く
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
  },
};
