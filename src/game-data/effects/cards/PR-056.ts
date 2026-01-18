import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、自身に貫通を付与する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    await System.show(stack, '貫通', 'ブロックを貫通してプレイヤーにダメージを与える');
    Effect.keyword(stack, self, self, '貫通');
  },

  // このユニットがプレイヤーアタックに成功した時、あなたはカードを1枚引く。
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'ドロー', 'カードを1枚引く');
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
