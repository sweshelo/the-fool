import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';
import { Color } from '@/submodule/suit/constant';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(
      stack,
      'スピードムーブ＆呪縛',
      '行動制限の影響を受けない\nターン開始時に行動権が回復しない'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '呪縛');
    Effect.speedMove(stack, stack.processing);
  },

  onBreak: async (stack: StackWithCard<Unit>) => {
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.color === Color.YELLOW &&
      stack.processing.id !== stack.target.id
    ) {
      await System.show(stack, '憤怒の雄叫び', '行動権を回復\nBP+2000');
      Effect.activate(stack, stack.processing, stack.processing, true);
      Effect.modifyBP(stack, stack.processing, stack.processing, 2000, {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
