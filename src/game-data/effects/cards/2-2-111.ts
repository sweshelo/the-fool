import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のユニットがフィールドに出た時
    if (!(stack.target instanceof Unit)) return;
    if (stack.target.owner.id !== opponent.id) return;
    const target = stack.target;

    // 捨札にインターセプトカードがあるか確認
    const interceptCards = owner.trash.filter(card => card.catalog.type === 'intercept');

    await EffectHelper.combine(stack, [
      // 自身を破壊する
      {
        title: '常闇と昇天',
        description: '自身を破壊',
        effect: () => Effect.break(stack, stack.processing, stack.processing),
      },
      // フィールドに出たユニットに【沈黙】を与える
      {
        title: '常闇と昇天',
        description: '【沈黙】を付与する',
        effect: () => Effect.keyword(stack, stack.processing, target, '沈黙'),
        condition: opponent.field.some(unit => unit.id === target.id),
      },
      // 捨札からインターセプトカードを1枚ランダムで手札に加える
      {
        title: '常闇と昇天',
        description: 'インターセプトカードを回収',
        effect: () => {
          EffectHelper.random(interceptCards, 1).forEach(card => {
            Effect.move(stack, stack.processing, card, 'hand');
          });
        },
        condition: interceptCards.length > 0,
      },
    ]);
  },
};
