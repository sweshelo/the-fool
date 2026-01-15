import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのフィールドに［赤／青］属性のユニットがいる場合、それぞれ以下の効果が発動する。
  // ●［赤］このユニットに【固着】と【無我の境地】を与える。
  // ●［青］対戦相手は手札を1枚ランダムで捨てる。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    // フィールドに赤属性のユニットがいるかチェック
    const hasRedUnit = owner.field.some(unit => unit.catalog.color === Color.RED);

    // フィールドに青属性のユニットがいるかチェック
    const hasBlueUnit = owner.field.some(unit => unit.catalog.color === Color.BLUE);

    // いずれかの効果が発動する場合、メッセージを表示
    if (hasRedUnit || hasBlueUnit) {
      const effects: string[] = [];
      if (hasRedUnit) effects.push('【固着】【無我の境地】');
      if (hasBlueUnit && opponent.hand.length > 0) effects.push('手札を1枚破壊');

      await System.show(stack, 'エレメント・タウロス', effects.join('\n'));

      // 赤属性の効果
      if (hasRedUnit) {
        Effect.keyword(stack, self, self, '固着');
        Effect.keyword(stack, self, self, '無我の境地');
      }

      // 青属性の効果
      if (hasBlueUnit && opponent.hand.length > 0) {
        const [target] = EffectHelper.random(opponent.hand, 1);
        if (target) {
          Effect.handes(stack, self, target);
        }
      }
    }
  },
};
