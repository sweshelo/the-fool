import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのフィールドに［赤／黄］属性のユニットがいる場合、それぞれ以下の効果が発動する。
  // ●［赤］このユニットに【スピードムーブ】を与える。
  // ●［黄］対戦相手のコスト2以下のユニットを1体選ぶ。それを対戦相手の手札に戻す。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;

    // フィールドに赤属性のユニットがいるかチェック
    const hasRedUnit = owner.field.some(unit => unit.catalog.color === Color.RED);

    // フィールドに黄属性のユニットがいるかチェック
    const hasYellowUnit = owner.field.some(unit => unit.catalog.color === Color.YELLOW);

    // 黄属性の効果：選択可能なユニットがいるかチェック
    const filter = (unit: Unit) => unit.owner.id === owner.opponent.id && unit.catalog.cost <= 2;
    const canSelectOpponent =
      hasYellowUnit && EffectHelper.isUnitSelectable(stack.core, filter, owner);

    await EffectHelper.combine(stack, [
      // 赤属性の効果
      {
        title: 'エレメント・スコーピオ',
        description: '【スピードムーブ】を得る',
        effect: () => Effect.speedMove(stack, self),
        condition: hasRedUnit,
      },
      // 黄属性の効果
      {
        title: 'エレメント・スコーピオ',
        description: '手札に戻す',
        effect: async () => {
          const [target] = await EffectHelper.pickUnit(
            stack,
            owner,
            filter,
            '手札に戻すユニットを選択'
          );
          Effect.bounce(stack, self, target);
        },
        condition: canSelectOpponent,
      },
    ]);
  },
};
