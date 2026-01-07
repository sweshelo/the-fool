import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■富の採掘
  // このユニットがフィールドに出た時、【機械】ユニットのカードを1枚ランダムで手札に加え、対戦相手のコスト2以下のユニットを1体選ぶ。それの行動権を消費する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 機械ユニットを1枚ランダムで手札に追加
    await System.show(stack, '富の採掘', '【機械】ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, owner, {
      species: '機械',
      type: ['unit', 'advanced_unit'],
    });

    // 対戦相手のコスト2以下のユニットをフィルタリング
    const filter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.opponent.id && unit.catalog.cost <= 2;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, '富の採掘', '行動権を消費');

      // ユニットを1体選択
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        filter,
        '行動権を消費するユニットを選択'
      );

      if (target) {
        // 行動権を消費
        Effect.activate(stack, stack.processing, target, false);
      }
    }
  },
};
