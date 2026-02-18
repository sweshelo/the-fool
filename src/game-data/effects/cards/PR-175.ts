import { Intercept } from '@/package/core/class/card';
import { Effect, EffectTemplate, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのターン終了時、あなたの紫ゲージが3以上の場合
  checkTurnEnd: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    return stack.source.id === owner.id && (owner.purple ?? 0) >= 3;
  },

  // あなたはカードを1枚引く
  // このインターセプトカードを5回使用した時、対戦相手に1ライフダメージを与える
  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    await EffectHelper.combine(stack, [
      {
        title: 'オークション',
        description: 'カードを1枚引く',
        effect: () => EffectTemplate.draw(owner, stack.core),
      },
      {
        title: 'オークション',
        description: '1ライフダメージ',
        effect: () => Effect.modifyLife(stack, stack.processing, opponent, -1),
        condition: stack.processing instanceof Intercept && stack.processing.remain === 0,
      },
    ]);
  },
};
