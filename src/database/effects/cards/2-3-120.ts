import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id && stack.processing.lv < 3) {
      await System.show(stack, '飛躍トキノボリ', 'レベル+1');
      Effect.clock(stack, stack.processing, stack.processing, 1);
    }
  },

  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const unitsFilter = (unit: Unit) => unit.owner.id === owner.id;
    const units_selectable = EffectHelper.isUnitSelectable(stack.core, unitsFilter, owner);

    if (units.length === 0) return;

    // 選択肢を提示
    const [choice] = await System.prompt(stack, owner.id, {
      type: 'option',
      title: '選略・操竿トキツリ',
      items: [
        { id: '1', description: 'レベル+1' },
        { id: '2', description: 'レベル-1' },
      ],
    });

    // 対象ユニットを選択
    const [targetId] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      unitsFilter,
      'レベルを変更するユニットを選択'
    );

    const target = owner.field.find(unit => unit.id === targetId);
    if (!target) return;

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・操竿トキツリ', 'レベル+1');
        Effect.clock(stack, stack.processing, target, 1);
        break;
      }
      case '2': {
        await System.show(stack, '選略・操竿トキツリ', 'レベル-1');
        Effect.clock(stack, stack.processing, target, -1);
        break;
      }
    }
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    if (stack.processing.lv >= 3) {
      stack.processing.owner.opponent.field.forEach(unit => {
        if (!unit.delta.some(delta => delta.source?.unit === stack.processing.id)) {
          Effect.modifyBP(stack, stack.processing, unit, -2000, {
            source: { unit: stack.processing.id },
          });
        }
      });
    } else {
      stack.processing.owner.opponent.field.forEach(unit => {
        if (unit.delta.some(delta => delta.source?.unit === stack.processing.id)) {
          unit.delta = unit.delta.filter(delta => delta.source?.unit !== stack.processing.id);
        }
      });
    }
  },
};
