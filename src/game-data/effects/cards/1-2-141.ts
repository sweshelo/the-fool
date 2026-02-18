import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    const target = stack.target;
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (!(target instanceof Unit)) return false;
    if (!(target.owner.id === opponent.id)) return false;

    return target.lv <= 2 || opponent.field.some(unit => unit.id === target.id);
  },

  onDrive: async (stack: StackWithCard<Unit>) => {
    const target = stack.target;
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (!(target instanceof Unit)) return;

    switch (target.lv) {
      case 1:
      case 2: {
        await EffectHelper.combine(stack, [
          {
            title: '封札の煉獄炎',
            description: '3000ダメージ',
            effect: () => Effect.damage(stack, stack.processing, target, 3000),
            condition: opponent.field.some(unit => unit.id === target.id),
          },
          {
            title: '封札の煉獄炎',
            description: 'デッキから1枚トリガーゾーンにセット',
            effect: () =>
              EffectHelper.random(owner.deck).forEach(card =>
                Effect.move(stack, stack.processing, card, 'trigger')
              ),
          },
        ]);
        break;
      }
      case 3: {
        await System.show(stack, '封札の煉獄炎', '10000ダメージ');
        Effect.damage(stack, stack.processing, target, 10000);
        break;
      }
    }
  },
};
