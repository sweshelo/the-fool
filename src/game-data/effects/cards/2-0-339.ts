import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.processing.owner.field.some(unit => unit.id === stack.target?.id)
    );
  },

  // 【固着】を与える
  onDrive: async (stack: StackWithCard<Unit>) => {
    if (!(stack.target instanceof Unit)) return;
    await System.show(stack, 'マルチタレント', '【固着】を付与');
    Effect.keyword(stack, stack.processing, stack.target, '固着');
  },

  // あなたのユニットが戦闘で勝利した時
  checkWin: (stack: StackWithCard): boolean => {
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.processing.owner.field.some(unit => unit.id === stack.target?.id)
    );
  },

  // 【セレクトハック】を与える
  onWin: async (stack: StackWithCard<Unit>) => {
    if (!(stack.target instanceof Unit)) return;
    await System.show(stack, 'マルチタレント', '【セレクトハック】を付与');
    Effect.keyword(stack, stack.processing, stack.target, 'セレクトハック');
  },

  // あなたのユニットがアタックした時
  checkAttack: (stack: StackWithCard): boolean => {
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.processing.owner.field.some(unit => unit.id === stack.target?.id)
    );
  },

  // 【不屈】を与える
  onAttack: async (stack: StackWithCard<Unit>) => {
    if (!(stack.target instanceof Unit)) return;
    await System.show(stack, 'マルチタレント', '【不屈】を付与');
    Effect.keyword(stack, stack.processing, stack.target, '不屈');
  },
};
