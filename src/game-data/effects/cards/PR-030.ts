import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import { PermanentEffect } from '../engine/permanent';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■沈黙付与
  // 手札から召喚された時、自身に【沈黙】を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '沈黙＆撲殺の時',
      '効果を発動することができない\nBP+4000\nBP-1000\n【不滅】を得る'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '沈黙');
  },

  // ■撲殺の時
  // 手札枚数に応じて効果を発動
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    const owner = stack.processing.owner;

    // 手札が2枚以下の時、このユニットのBPを+4000する
    PermanentEffect.mount(stack, stack.processing, {
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, unit, 4000, {
            source,
          });
        }
      },
      targets: ['self'],
      condition: () => owner.hand.length <= 2,
      effectCode: 'BP増加_手札2枚以下',
    });

    // 手札が1枚以下の時、対戦相手のユニットのBPを-1000する
    PermanentEffect.mount(stack, stack.processing, {
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, unit, -1000, {
            source,
          });
        }
      },
      targets: ['opponents'],
      condition: () => owner.hand.length <= 1,
      effectCode: 'BP低下_手札1枚以下',
    });

    // 手札が0枚の時、このユニットに【不滅】を与える
    PermanentEffect.mount(stack, stack.processing, {
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.keyword(stack, stack.processing, unit, '不滅', {
            source,
          });
        }
      },
      targets: ['self'],
      condition: () => owner.hand.length === 0,
      effectCode: '不滅_手札0枚',
    });
  },
};
