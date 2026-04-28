import type { Card } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  // トリガー: あなたがプレイヤーアタックを受けた時
  checkPlayerAttack: (stack: StackWithCard<Card>): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    return (
      stack.target?.id === stack.processing.owner.id &&
      owner.hand.length > 0 &&
      owner.field.length + opponent.field.length > 0
    );
  },

  onPlayerAttack: async (stack: StackWithCard<Card>): Promise<void> => {
    // ランダムに手札を1枚捨てる
    const cards = EffectHelper.random(stack.processing.owner.hand, 1);
    const card = cards[0];
    if (card) {
      await System.show(
        stack,
        'パラライズ・フォグ',
        '全てのユニットの行動権を消費\n【呪縛】を付与'
      );

      Effect.break(stack, stack.processing, card);

      // 全てのユニットの行動権を消費し、呪縛を与える
      const allUnits = stack.core.players.flatMap(p => p.field);
      for (const unit of allUnits) {
        Effect.activate(stack, stack.processing, unit, false);
        Effect.keyword(stack, stack.processing, unit, '呪縛');
      }
    }
  },
};
