import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const ownerTargets = stack.processing.owner.field.filter(
      unit => unit.id !== stack.processing.id
    );
    const opponentTargets = stack.processing.owner.opponent.field;
    const targets = [...ownerTargets, ...opponentTargets];

    await EffectHelper.combine(stack, [
      {
        title: '神怒の豪雷',
        description: '自身以外を消滅',
        effect: () => {
          EffectHelper.exceptSelf(stack.core, stack.processing, unit =>
            Effect.delete(stack, stack.processing, unit)
          );
        },
        condition: targets.length > 0,
      },
      {
        title: '神怒の豪雷',
        description: '基本BP+2000\n【加護】を得る',
        effect: () => {
          Effect.modifyBP(stack, stack.processing, stack.processing, 2000, { isBaseBP: true });
          Effect.keyword(stack, stack.processing, stack.processing, '加護');
        },
        condition: ownerTargets.length >= 2,
      },
      {
        title: '進化禁止',
        description: '進化することができない',
        effect: () => {
          Effect.keyword(stack, stack.processing, stack.processing, '進化禁止');
        },
      },
      {
        title: '神征の楔',
        description: 'コスト6以上をフィールドに出せない',
        effect: () => {},
      },
    ]);
  },

  fieldEffect: async (stack: StackWithCard): Promise<void> => {
    PermanentEffect.mount(stack.processing, {
      effect: (card, source) => Effect.ban(stack, stack.processing, card, { source }),
      targets: ['opponents', 'hand'],
      condition: card => card.catalog.cost >= 6 && card instanceof Unit,
      effectCode: '神征の楔',
    });
  },
};
