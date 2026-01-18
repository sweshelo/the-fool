import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのフィールドに［赤／黄］属性のユニットがいる場合、それぞれ以下の効果が発動する。
  // ●［赤］対戦相手のユニットを1体選ぶ。それに【防御禁止】を与える。
  // ●［黄］あなたはトリガーカードを1枚引く。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;

    // フィールドに赤属性のユニットがいるかチェック
    const hasRedUnit = owner.field.some(unit => unit.catalog.color === Color.RED);

    // フィールドに黄属性のユニットがいるかチェック
    const hasYellowUnit = owner.field.some(unit => unit.catalog.color === Color.YELLOW);

    // 赤属性の効果：選択可能なユニットがいるかチェック
    const canSelectOpponent =
      hasRedUnit && EffectHelper.isUnitSelectable(stack.core, 'opponents', owner);

    // いずれかの効果が発動する場合、メッセージを表示
    if (canSelectOpponent || hasYellowUnit) {
      const effects: string[] = [];
      if (canSelectOpponent) effects.push('【防御禁止】を付与');
      if (hasYellowUnit) effects.push('トリガーカードを1枚引く');

      await System.show(stack, 'エレメント・ヴァルゴ', effects.join('\n'));

      // 赤属性の効果
      if (canSelectOpponent) {
        const [target] = await EffectHelper.pickUnit(
          stack,
          owner,
          'opponents',
          '【防御禁止】を与えるユニットを選択'
        );
        Effect.keyword(stack, self, target, '防御禁止');
      }

      // 黄属性の効果
      if (hasYellowUnit) {
        EffectTemplate.reinforcements(stack, owner, { type: ['trigger'] });
      }
    }
  },
};
