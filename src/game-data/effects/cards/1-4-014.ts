import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのフィールドに［青／緑］属性のユニットがいる場合、それぞれ以下の効果が発動する。
  // ●［青］対戦相手のレベル2以上のユニットを1体選ぶ。それを破壊する。
  // ●［緑］このユニットの基本BPを+3000する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;

    // フィールドに青属性のユニットがいるかチェック
    const hasBlueUnit = owner.field.some(unit => unit.catalog.color === Color.BLUE);

    // フィールドに緑属性のユニットがいるかチェック
    const hasGreenUnit = owner.field.some(unit => unit.catalog.color === Color.GREEN);

    // 青属性の効果：選択可能なユニットがいるかチェック
    const filter = (unit: Unit) => unit.owner.id === owner.opponent.id && unit.lv >= 2;
    const canSelectOpponent =
      hasBlueUnit && EffectHelper.isUnitSelectable(stack.core, filter, owner);

    await EffectHelper.combine(stack, [
      // 青属性の効果
      {
        title: 'エレメント・ジェミニ',
        description: 'レベル2以上のユニットを1体破壊',
        effect: async () => {
          const [target] = await EffectHelper.pickUnit(
            stack,
            owner,
            filter,
            '破壊するユニットを選択'
          );
          Effect.break(stack, self, target);
        },
        condition: canSelectOpponent,
      },
      // 緑属性の効果
      {
        title: 'エレメント・ジェミニ',
        description: '基本BP+3000',
        effect: () => Effect.modifyBP(stack, self, self, 3000, { isBaseBP: true }),
        condition: hasGreenUnit,
      },
    ]);
  },
};
