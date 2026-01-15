import type { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【貫通】を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '貫通', 'ブロックを貫通してダメージを与える');
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
  },

  // このユニットがプレイヤーアタックに成功した時、あなたはカードを1枚引く
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'ドロー', 'カードを1枚引く');
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
