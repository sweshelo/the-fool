import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのフィールドに［黄／緑］属性のユニットがいる場合、それぞれ以下の効果が発動する。
  // ●［黄］このユニットに【加護】を与える。
  // ●［緑］対戦相手のユニットを1体選ぶ。それに【攻撃禁止】を与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;

    // フィールドに黄属性のユニットがいるかチェック
    const hasYellowUnit = owner.field.some(unit => unit.catalog.color === Color.YELLOW);

    // フィールドに緑属性のユニットがいるかチェック
    const hasGreenUnit = owner.field.some(unit => unit.catalog.color === Color.GREEN);

    // 緑属性の効果：選択可能なユニットがいるかチェック
    const canSelectOpponent =
      hasGreenUnit && EffectHelper.isUnitSelectable(stack.core, 'opponents', owner);

    await EffectHelper.combine(stack, [
      // 黄属性の効果
      {
        title: 'エレメント・ピスケス',
        description: '【加護】を得る',
        effect: () => Effect.keyword(stack, self, self, '加護'),
        condition: hasYellowUnit,
      },
      // 緑属性の効果
      {
        title: 'エレメント・ピスケス',
        description: '【攻撃禁止】を付与',
        effect: async () => {
          const [target] = await EffectHelper.pickUnit(
            stack,
            owner,
            'opponents',
            '【攻撃禁止】を与えるユニットを選択'
          );
          Effect.keyword(stack, self, target, '攻撃禁止');
        },
        condition: canSelectOpponent,
      },
    ]);
  },
};
