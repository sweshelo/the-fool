import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '神速の一閃', 'レベル1の時ブロックされない');
  },

  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    //すでにレベルが最大の場合は発動しない
    if (stack.processing.lv >= 3) return;

    await System.show(stack, '無我夢中の鍛錬', 'レベル+1');
    Effect.clock(stack, stack.processing, stack.processing, 1);
  },

  onOverclockSelf: async (stack: StackWithCard): Promise<void> => {
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, '白夜の封剣', '行動権を消費\n【呪縛】を付与');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '行動権を消費し【呪縛】を与えるユニットを選択'
      );

      if (target) {
        Effect.activate(stack, stack.processing, target, false);
        Effect.keyword(stack, stack.processing, target, '呪縛');
      }
    }
  },

  fieldEffect: (stack: StackWithCard) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '次元干渉', { source });
      },
      effectCode: '神速の一閃',
      targets: ['self'],
      condition: target => target.lv === 1,
    });
  },
};
