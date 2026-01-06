import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Delta } from '@/package/core/class/delta';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targetsFilter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.id && stack.processing.id !== unit.id;
    const targets_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      targetsFilter,
      stack.processing.owner
    );
    if (targets_selectable) {
      await System.show(stack, 'マジカル☆スウィート', '手札に戻す\nコスト-1');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        targetsFilter,
        '手札に戻すユニットを選択してください',
        1
      );
      Effect.bounce(stack, stack.processing, target, 'hand');
      target.delta.push(new Delta({ type: 'cost', value: -1 }, { permanent: true }));
    }
  },

  isBootable: (core: Core, self: Unit) => {
    return EffectHelper.candidate(core, () => true, self.owner).length > 0;
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targetsFilter = () => true;
    const targets_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      targetsFilter,
      stack.processing.owner
    );
    await System.show(stack, '起動・あま～いイチゴケーキ♪', 'ユニットのレベルを-1');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      targetsFilter,
      'レベルを下げるユニットを選択して下さい',
      1
    );
    Effect.clock(stack, stack.processing, target, -1);
  },
};
