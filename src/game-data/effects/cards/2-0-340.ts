import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■抑制剤
  // レベル2以上のユニットがフィールドに出た時、フィールドに出たユニットのレベルを-1する。あなたはインターセプトカードを1枚引く。
  checkDrive: (stack: StackWithCard): boolean => {
    // レベル2以上のユニットが出た時に発動
    return stack.target instanceof Unit && stack.target.lv >= 2;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;

    await System.show(stack, '抑制剤', 'レベル-1\nインターセプトを1枚引く');

    // フィールドに出たユニットのレベルを-1する
    Effect.clock(stack, stack.processing, stack.target, -1);

    // インターセプトカードを1枚引く
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },
};
