import { Effect } from '@/game-data/effects/engine/effect';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit, type Card } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, '従順な眷属＆滾るステップ', 'BP+[紫ゲージ×500]\n【加護】を得る');
  },
  onAttackSelf: async (stack: StackWithCard) => {
    if (
      (stack.processing.owner.purple ?? 0) < 3 ||
      stack.processing.owner.opponent.field.length === 0
    )
      return;
    await System.show(stack, 'デッドリーダンス', '敵全体の基本BP-1000');
    stack.processing.owner.opponent.field.forEach(unit =>
      Effect.modifyBP(stack, stack.processing, unit, -1000, { isBaseBP: true })
    );
  },
  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '加護', { source });
      },
      effectCode: '滾るステップ',
      targets: ['self'],
      condition: (target: Card) => (target.owner.purple ?? 0) <= 4,
    });

    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.modifyBP(
            stack,
            stack.processing,
            target,
            (stack.processing.owner.purple ?? 0) * 500,
            { source }
          );
      },
      effectCode: '従順な眷属',
      targets: ['owns'],
    });
  },
};
