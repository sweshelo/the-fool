import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.id === stack.source.id || stack.processing.lv >= 3) return;
    await System.show(stack, 'ゴリ益', '自身のレベル+1');
    Effect.clock(stack, stack.processing, stack.processing, 1);
  },

  onClockupSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const filter = (unit: Unit) => unit.owner.id !== self.owner.id && unit.currentBP <= self.currentBP;

    if (EffectHelper.isUnitSelectable(stack.core, filter, self.owner)) {
      await System.show(stack, 'ゴリ押し', '自身のBP以下のユニットを1体破壊');
      const [target] = await EffectHelper.pickUnit(
        stack,
        self.owner,
        filter,
        '破壊するユニットを選択して下さい'
      );
      if (!target || target.currentBP > self.currentBP) return;
      Effect.break(stack, self, target);
    }
  },

  onOverclockSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.field.length < stack.core.room.rule.player.max.field) {
      await System.show(stack, 'ゴリ夢中', '[ゴリデス]を【特殊召喚】');
      await Effect.summon(stack, stack.processing, new Unit(stack.processing.owner, '1-3-227'));
    }
  },
};
