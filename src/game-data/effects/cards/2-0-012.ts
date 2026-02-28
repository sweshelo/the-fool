import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const ownerTargets = stack.processing.owner.field.filter(
      unit => unit.id !== stack.processing.id
    );
    const opponentTargets = stack.processing.owner.opponent.field;
    const targets = [...ownerTargets, ...opponentTargets];

    if (targets.length > 0) {
      if (ownerTargets.length >= 2) {
        await System.show(
          stack,
          '神怒の豪雷＆進化禁止',
          '進化することができない\n自身以外を消滅\n基本BP+2000\n【加護】を得る'
        );
        Effect.modifyBP(stack, stack.processing, stack.processing, 2000, { isBaseBP: true });
        Effect.keyword(stack, stack.processing, stack.processing, '加護');
      } else {
        await System.show(stack, '神怒の豪雷＆進化禁止', '進化することができない\n自身以外を消滅');
      }
      EffectHelper.exceptSelf(stack.core, stack.processing, unit =>
        Effect.delete(stack, stack.processing, unit)
      );
    } else {
      await System.show(stack, '進化禁止', '進化することができない');
    }

    Effect.keyword(stack, stack.processing, stack.processing, '進化禁止');
  },

  fieldEffect: async (stack: StackWithCard): Promise<void> => {
    PermanentEffect.mount(stack.processing, {
      effect: (card, source) => Effect.ban(stack, stack.processing, card, { source }),
      targets: ['opponents', 'hand'],
      condition: card => card.catalog.cost >= 7,
      effectCode: '神制の耀矢',
    });
  },
};
