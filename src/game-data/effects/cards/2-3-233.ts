import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnStart: (stack: StackWithCard): boolean => {
    return (
      stack.source.id === stack.processing.owner.id &&
      stack.processing.owner.field.length === 3 &&
      !!stack.processing.owner.field.find(unit => unit.catalog.name === '織女星ベガ') &&
      !!stack.processing.owner.field.find(unit => unit.catalog.name === '牽牛星アルタイル') &&
      !!stack.processing.owner.field.find(unit => unit.catalog.name === '天川星デネブ')
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    // 対戦相手のフィールド、トリガーゾーン、手札のカードをリストアップ
    const targetCards = [...opponent.field, ...opponent.trigger, ...opponent.hand];

    await EffectHelper.combine(stack, [
      {
        title: 'トリニティ・アステリズム',
        description: 'フィールド/トリガーゾーン/手札から3枚消滅',
        effect: () => {
          // 消滅させる枚数（最大3枚まで）
          const randomCards = EffectHelper.random(targetCards, 3);
          // 選択したカードを消滅させる
          for (const card of randomCards) {
            Effect.delete(stack, stack.processing, card);
          }
        },
        condition: targetCards.length > 0,
      },
      {
        title: 'トリニティ・アステリズム',
        description: '3ライフダメージ',
        effect: () =>
          Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -3),
      },
    ]);
  },
};
