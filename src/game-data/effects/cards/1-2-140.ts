import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  //■グラウンド・へヴィ
  //あなたのユニットがフィールドに出た時、それに【固着】と【無我の境地】を与える。
  //その時あなたの手札が0枚の場合、あなたの全てのユニットに【固着】と【無我の境地】を与える。

  //自身のユニットが出た時
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    if (owner.id !== stack.source.id) return false;

    const hasHand = owner.hand.length > 0;
    const hasField = owner.field.length > 0;
    const targetOnField = owner.field.some(u => u.id === stack.target?.id);

    return (!hasHand && hasField) || (hasHand && targetOnField);
  },

  onDrive: async (stack: StackWithCard<Unit>) => {
    if (!(stack.target instanceof Unit)) return;

    const target = stack.target;
    const owner = stack.processing.owner;

    if (owner.hand.length === 0) {
      await System.show(stack, 'グラウンド・へヴィ', '味方全体に【固着】と【無我の境地】を付与');
      //手札が0枚の場合、全ユニットに付与
      owner.field.forEach(unit => {
        Effect.keyword(stack, stack.processing, unit, '固着');
        Effect.keyword(stack, stack.processing, unit, '無我の境地');
      });
    } else {
      await System.show(stack, 'グラウンド・へヴィ', '【固着】と【無我の境地】を付与');
      Effect.keyword(stack, stack.processing, target, '固着');
      Effect.keyword(stack, stack.processing, target, '無我の境地');
    }
  },
};
