import { PermanentEffect } from '@/game-data/effects/engine/permanent';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(
      stack,
      '五輪書',
      '味方全体のBP+1000\n【侍】に【不屈】【貫通】【スピードムーブ】【無我の境地】【固着】を付与'
    );
  },

  onPlayerAttackSelf: async (stack: StackWithCard) => {
    await System.show(stack, '二天流', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },

  fieldEffect: (stack: StackWithCard) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.modifyBP(stack, stack.processing, target, 1000, { source });
      },
      effectCode: '五輪書_BP',
      targets: ['owns'],
    });

    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.keyword(stack, stack.processing, target, '不屈', { source });
          Effect.keyword(stack, stack.processing, target, '貫通', { source });
          Effect.keyword(stack, stack.processing, target, '無我の境地', { source });
          Effect.keyword(stack, stack.processing, target, '固着', { source });
          Effect.speedMove(stack, target);
        }
      },
      effectCode: '五輪書_侍',
      targets: ['owns'],
      condition: target =>
        target instanceof Unit &&
        target.catalog.species?.includes('侍') &&
        stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('侍')).length >=
          2,
    });
  },
};
