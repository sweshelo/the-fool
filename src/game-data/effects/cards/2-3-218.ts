import { Unit, type Card } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Core } from '@/package/core';
import { PermanentEffect } from '../engine/permanent';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';

export const effects: CardEffects = {
  handEffect: (core: Core, self: Card) => {
    PermanentEffect.mount(self, {
      effect: (target, source) =>
        Effect.dynamicCost(target, {
          source,
          calculator: () => core.round,
        }),
      effectCode: '悠久のセレマ',
      targets: ['self'],
    });
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.dynamicBP(stack, stack.processing, target, () => stack.core.round * 1000, {
            source,
          });
        }
      },
      effectCode: 'タイムパラドックス',
      targets: ['self'],
    });
  },

  onDriveSelf: async (stack: StackWithCard) => {
    const targets = stack.processing.owner.opponent.field.filter(
      unit => unit.currentBP <= stack.core.round * 1000
    );
    await System.show(
      stack,
      `${targets.length > 0 ? 'クロノステイシス＆' : ''}タイムパラドックス`,
      `${targets.length > 0 ? '敵全体のBP[ラウンド数×1000]以下を破壊\n' : ''}BP+[ラウンド数×1000]`
    );

    targets.forEach(unit => Effect.break(stack, stack.processing, unit, 'effect'));
  },
};
