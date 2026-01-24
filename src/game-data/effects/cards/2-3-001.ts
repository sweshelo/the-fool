import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■アサルトチャージャー
  // このユニットがフィールドに出た時、あなたのコスト2以上の【機械】ユニットを1体選ぶ。それに【スピードムーブ】を与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // コスト2以上の機械ユニットをフィルタリング
    const filter = (unit: Unit) =>
      unit.owner.id === owner.id &&
      unit.catalog.cost >= 2 &&
      unit.catalog.species?.includes('機械');

    // 選択可能なユニットが存在するかチェック
    if (!EffectHelper.isUnitSelectable(stack.core, filter, owner)) return;

    await System.show(stack, 'アサルトチャージャー', '【スピードムーブ】を付与');

    // ユニット選択
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      filter,
      '【スピードムーブ】を与えるユニットを選択'
    );

    // スピードムーブを与える
    Effect.speedMove(stack, target);
  },
};
