import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■大人買い
  // あなたのユニットがフィールドに出た時、あなたは1ライフダメージを受ける。ユニットカードとインターセプトカードを1枚ずつ引く。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のユニットが出た時のみ発動
    if (stack.source.id !== owner.id) return false;

    return stack.target instanceof Unit;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '大人買い', '1ライフダメージ\nユニットとインターセプトを引く');

    // 1ライフダメージを受ける（ジョーカーゲージは増えない）
    Effect.modifyLife(stack, stack.processing, owner, -1);

    // ユニットカードを1枚引く
    EffectTemplate.reinforcements(stack, owner, { type: ['unit'] });

    // インターセプトカードを1枚引く
    EffectTemplate.reinforcements(stack, owner, { type: ['intercept'] });
  },

  // あなたのターン終了時、トリガーカードを1枚引く。
  checkTurnEnd: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のターン終了時のみ発動
    return stack.core.getTurnPlayer().id === owner.id;
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '大人買い', 'トリガーカードを1枚引く');

    // トリガーカードを1枚引く
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
  },
};
