import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';

export const effects: CardEffects = {
  // ユニットの生存チェックを兼ねる
  checkDrive: stack =>
    stack.processing.owner.opponent.field.some(unit => unit.id === stack.target?.id),
  onDrive: async (stack: StackWithCard) => {
    if (stack.target instanceof Unit) {
      switch (stack.processing.lv) {
        case 1:
        case 2: {
          await System.show(
            stack,
            '封札の煉獄炎',
            '3000ダメージ\nデッキから1枚トリガーゾーンにセット'
          );
          Effect.damage(stack, stack.processing, stack.target, 3000);
          EffectHelper.random(stack.processing.owner.deck).forEach(card =>
            Effect.move(stack, stack.processing, card, 'trigger')
          );
          break;
        }
        case 3: {
          await System.show(stack, '封札の煉獄炎', '10000ダメージ');
          Effect.damage(stack, stack.processing, stack.target, 10000);
        }
      }
    }
  },
};
