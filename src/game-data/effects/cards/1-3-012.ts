import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■富の採掘
  // このユニットがフィールドに出た時、【機械】ユニットのカードを1枚ランダムで手札に加え
  // 対戦相手のコスト2以下のユニットを1体選ぶ。それの行動権を消費する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 対戦相手のコスト2以下のユニットをフィルタリング
    const filter = (unit: Unit) => unit.owner.id === owner.opponent.id && unit.catalog.cost <= 2;

    await EffectHelper.combine(stack, [
      // 機械ユニットを1枚ランダムで手札に追加
      {
        title: '富の採掘',
        description: '【機械】ユニットを1枚引く',
        effect: () =>
          EffectTemplate.reinforcements(stack, owner, {
            species: '機械',
            type: ['unit', 'advanced_unit'],
          }),
      },
      // 行動権を消費
      {
        title: '富の採掘',
        description: '行動権を消費',
        effect: async () => {
          const [target] = await EffectHelper.pickUnit(
            stack,
            owner,
            filter,
            '行動権を消費するユニットを選択'
          );

          if (target) {
            Effect.activate(stack, stack.processing, target, false);
          }
        },
        condition: EffectHelper.isUnitSelectable(stack.core, filter, owner),
      },
    ]);
  },
};
