import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await EffectHelper.combine(stack, [
      {
        title: 'マイクロバースト',
        description: '紫属性のインターセプトカードを1枚セット\n紫ゲージ+1',
        condition: (stack.processing.owner.purple ?? 0) <= 2,
        effect: async () => {
          EffectHelper.random(
            stack.processing.owner.deck.filter(
              card => card.catalog.type === 'intercept' && card.catalog.color === Color.PURPLE
            )
          ).forEach(card => {
            Effect.move(stack, stack.processing, card, 'trigger');
          });
          await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
        },
      },
      {
        title: '栄光の凱歌',
        description: 'BP+3000\n【不屈】を得る',
        effect: () => {},
      },
    ]);
  },
  onAttack: async (stack: StackWithCard) => {
    if (stack.source.id === stack.processing.owner.id) return;
    await System.show(stack, 'マイクロバースト', '紫ゲージ+1');
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  },
  fieldEffect: (stack: StackWithCard) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, target, 3000, { source });
          Effect.keyword(stack, stack.processing, target, '不屈', { source });
        }
      },
      condition: target => (target.owner.purple ?? 0) >= 3,
      effectCode: '栄光の凱歌',
      targets: ['self'],
    });
  },
};
