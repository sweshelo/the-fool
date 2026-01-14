import type { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, '闘士／忍者', 'BP+[【忍者】×1000]');
  },

  onPlayerAttackSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.lv >= 3) return;

    await System.show(stack, 'アタック・クロック', 'レベル+1');
    Effect.clock(stack, stack.processing, stack.processing, 1);
  },

  onOverclockSelf: async (stack: StackWithCard) => {
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) return;
    await System.show(stack, '月光手裏剣', '基本BP-2000');
    const targets = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '基本BPを下げるユニットを選択して下さい',
      2
    );
    targets.forEach(unit =>
      Effect.modifyBP(stack, stack.processing, unit, -2000, { isBaseBP: true })
    );
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    const delta = stack.processing.delta.find(delta => delta.source?.unit === stack.processing.id);
    const value =
      stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('忍者')).length *
      1000;
    if (delta && delta.effect.type === 'bp') {
      delta.effect.diff = value;
    } else {
      Effect.modifyBP(stack, stack.processing, stack.processing, value, {
        source: { unit: stack.processing.id },
      });
    }
  },
};
