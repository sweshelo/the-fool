import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id && stack.processing.lv < 3) {
      await System.show(stack, '飛躍トキノボリ', 'レベル+1');
      Effect.clock(stack, stack.processing, stack.processing, 1);
    }
  },

  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    if (!EffectHelper.isUnitSelectable(stack.core, 'all', stack.processing.owner)) return;

    // 選択肢を提示
    const choice = await EffectHelper.choice(stack, owner, '選略・操竿トキツリ', [
      { id: '1', description: 'レベル+1' },
      { id: '2', description: 'レベル-1' },
    ]);

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・操竿トキツリ', 'レベル+1');
        // 対象ユニットを選択
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'all',
          'レベルを変更するユニットを選択'
        );
        Effect.clock(stack, stack.processing, target, 1);
        break;
      }
      case '2': {
        await System.show(stack, '選略・操竿トキツリ', 'レベル-1');
        // 対象ユニットを選択
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'all',
          'レベルを変更するユニットを選択'
        );
        Effect.clock(stack, stack.processing, target, -1);
        break;
      }
    }
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, target, -1000, { source });
        }
      },
      condition: () => stack.processing.lv >= 3,
      effectCode: '龍宮の刻煙',
      targets: ['opponents'],
    });
  },
};
