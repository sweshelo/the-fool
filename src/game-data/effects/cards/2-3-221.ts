import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Delta } from '@/package/core/class/delta';
import { PermanentEffect } from '../engine/permanent';
import { Color } from '@/submodule/suit/constant';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '翠龍の眼光＆秩序の盾',
      'コスト1のユニットを出せない\n対戦相手の効果によるダメージを受けない'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
  },

  // このユニットが破壊された時、あなたの手札の緑属性カードからランダムで1枚のコストを-1する。
  onBreakSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const greenCards = owner.hand.filter(card => card.catalog.color === Color.GREEN);

    if (greenCards.length > 0) {
      const [selectedCard] = EffectHelper.random(greenCards, 1);
      if (selectedCard) {
        await System.show(stack, '砕かれた翠の輝き', '緑属性カードのコスト-1');
        Effect.modifyCost(selectedCard, -1);
      }
    }
  },

  // 対戦相手は手札からコスト1のユニットをフィールドに出すことができない。
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      targets: ['opponents', 'hand'],
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          unit.delta.push(new Delta({ type: 'banned' }, { source }));
        }
      },
      condition: target => target instanceof Unit && target.catalog.cost === 1,
      effectCode: '翠龍の眼光',
    });
  },
};
