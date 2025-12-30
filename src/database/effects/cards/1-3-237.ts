import type { Card } from '@/package/core/class/card';
import { Effect, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // トリガー: 対戦相手の効果によって対戦相手のCPが増加した時
  checkModifyCP: (stack: StackWithCard<Card>): boolean => {
    return (
      stack.target?.id === stack.processing.owner.opponent.id &&
      stack.processing.owner.id === stack.processing.owner.opponent.id
    );
  },

  onModifyCP: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '死神のランプ', 'CP-4');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner.opponent, -4);
  },

  // トリガー: あなたのターン開始時
  checkTurnStart: (stack: StackWithCard<Card>): boolean => {
    return stack.source.id === stack.processing.owner.id;
  },

  onTurnStart: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '死神のランプ', 'カードを1枚引く');
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
