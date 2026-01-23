import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.processing.owner.id === stack.source.id &&
  // 対戦相手のユニットが存在する場合
      stack.processing.owner.opponent.field.length > 0
    );
  },
  // あなたのユニットがフィールドに出た時
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 捨札の赤属性のカードの枚数をカウント
    const redCardsCount = owner.trash.filter(card => card.catalog.color === Color.RED).length;

    // ダメージ量を計算
    const damage = redCardsCount * 1000;

      await System.show(
        stack,
        '絨毯爆撃',
        `対戦相手のユニットからランダムで1体に${damage}ダメージ`
      );

      // 対戦相手のユニットからランダムで1体を選択
      const [target] = EffectHelper.random(opponent.field, 1);
      if (target instanceof Unit) {
        Effect.damage(stack, stack.processing, target, damage);
      }
    
  },
};
