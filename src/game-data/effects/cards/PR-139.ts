import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■闇黒への招待
  // このユニットがフィールドに出た時、あなたのユニットを2体選ぶ。それを破壊する。あなたの紫ゲージを+5する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;

    // 自分のフィールドにユニットが2体以上いるか確認（自身を除く）
    const ownUnitsFilter = (unit: Unit) => unit.owner.id === owner.id && unit.id !== self.id;
    const ownUnits = owner.field.filter(ownUnitsFilter);
    if (ownUnits.length < 2) return;

    await System.show(stack, '闇黒への招待', '味方ユニットを2体破壊\n紫ゲージ+5');

    // 自分のユニットを2体選ぶ
    const targets = await EffectHelper.pickUnit(
      stack,
      owner,
      ownUnitsFilter,
      '破壊するユニットを2体選択',
      2
    );

    // 選択したユニットを破壊
    for (const target of targets) {
      Effect.break(stack, self, target);
    }

    // 紫ゲージを+5する
    await Effect.modifyPurple(stack, self, owner, 5);
  },
};
