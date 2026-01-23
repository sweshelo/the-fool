import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    // 対戦相手のフィールドにユニットが3体以上いる場合
    if (stack.processing.owner.opponent.field.length >= 3) {
      // このユニットに【スピードムーブ】を与える
      await System.show(stack, '海賊流の戦い', '【スピードムーブ】を付与');
      Effect.speedMove(stack, stack.processing);
    }
  },

  // このユニットがアタックした時
  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    //対戦相手のBP7000以上のユニットを1体選ぶ。それを破壊する
    const filter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.opponent.id && unit.currentBP >= 7000;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, '魂の略奪', 'ユニットを破壊');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '破壊するユニットを選択して下さい'
      );
      Effect.break(stack, stack.processing, target);
    }
  },
};
