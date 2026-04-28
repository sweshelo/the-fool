import { PermanentEffect } from '@/game-data/effects/engine/permanent';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '黄金蝶の鱗粉', '【加護】\n【神獣】のBP+3000\n【不滅】を付与');
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    // 【神獣】ユニットのBPを+3000し、【不滅】を付与
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, target, 3000, { source });
          Effect.keyword(stack, stack.processing, target, '不滅', { source });
        }
      },
      effectCode: '黄金蝶の鱗粉',
      condition: target => target instanceof Unit && target.catalog.species?.includes('神獣'),
      targets: ['owns'],
    });
  },

  onTurnEnd: async (stack: StackWithCard<Unit>) => {
    // 相手のターン終了時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      return;
    }

    await System.show(stack, '幻の黄金蝶', '手札に戻す');
    Effect.bounce(stack, stack.processing, stack.processing, 'hand');
  },
};
