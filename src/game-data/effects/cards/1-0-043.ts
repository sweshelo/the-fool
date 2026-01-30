import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { GREEN_COMBO } from '../engine/helper/combo';

export const effects: CardEffects = {
  // ■チャージ
  // このユニットがフィールドに出た時、あなたのCPを+2する。
  // ■連撃・グラインドドロー
  // このユニットがフィールドに出た時、このターンにあなたがこのユニット以外のコスト2以上の緑属性のカードを使用している場合、
  // あなたはカードを1枚引く。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await EffectHelper.combine(stack, [
      {
        title: 'チャージ',
        description: 'CP+2',
        effect: () => Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2),
      },
      {
        title: 'グラインドドロー',
        description: 'カードを1枚引く',
        effect: () => EffectTemplate.draw(stack.processing.owner, stack.core),
        condition: EffectHelper.combo(stack.core, GREEN_COMBO(2)),
      },
    ]);
  },
};
