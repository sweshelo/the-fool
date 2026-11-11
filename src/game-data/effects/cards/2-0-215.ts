import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '不屈', 'ターン終了時に行動権を回復');
    Effect.keyword(stack, stack.processing, stack.processing, '不屈');
  },
  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    await EffectHelper.combine(stack, [
      {
        title: 'エナジーボルテックス',
        description: '基本BP+2000',
        effect: () =>
          Effect.modifyBP(stack, stack.processing, stack.processing, 2000, { isBaseBP: true }),
      },
      {
        title: 'エナジーボルテックス',
        description: '基本BP-2000',
        effect: async () => {
          const [target] = await EffectHelper.pickUnit(
            stack,
            stack.processing.owner,
            'opponents',
            '基本BPを-2000するユニットを選択して下さい'
          );
          Effect.modifyBP(stack, stack.processing, target, -2000, { isBaseBP: true });
        },
        condition: EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner),
        order: -1,
      },
    ]);
  },
};
