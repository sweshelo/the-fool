import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // ■清き水の導き
  // このユニットがフィールドに出た時、あなたのフィールドのユニットが4体以下の場合、あなたの捨札にある進化ユニット以外のコスト3の青属性のユニットをランダムで1体【特殊召喚】する。
  // ■インターセプトドロー
  // このユニットが破壊された時、あなたはインターセプトカードを1枚引く。

  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // フィールドのユニットが4体以下かチェック
    if (owner.field.length <= 4) {
      // 捨札にある進化ユニット以外のコスト3の青属性のユニットを検索
      const candidates = owner.trash.filter(
        card =>
          card instanceof Unit &&
          !(card instanceof Evolve) && // 進化ユニット以外
          card.catalog.cost === 3 &&
          card.catalog.color === Color.BLUE
      );

      if (candidates.length > 0) {
        await System.show(stack, '清き水の導き', '青属性コスト3のユニットを特殊召喚');

        // ランダムで1体選ぶ
        const [randomUnit] = EffectHelper.random(candidates, 1);
        // 特殊召喚
        if (randomUnit instanceof Unit)
          await Effect.summon(stack, stack.processing, randomUnit, false);
      }
    }
  },

  // 破壊された時の効果
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'インターセプトドロー', 'インターセプトカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },
};
