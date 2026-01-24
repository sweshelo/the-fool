import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■ドッペルゲンガー
  // あなたのユニットがフィールドに出た時、あなたのフィールドのユニットが4体以下の場合、それを【複製】する。そうした場合、フィールドに出たユニットを破壊する。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のユニットが出た時のみ発動
    if (stack.source.id !== owner.id) return false;

    // フィールドのユニットが4体以下か確認
    return owner.field.length <= 4;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    if (!(stack.target instanceof Unit)) return;

    await System.show(stack, 'ドッペルゲンガー', 'ユニットを【複製】\n元のユニットを破壊');

    // ユニットを複製する
    await Effect.clone(stack, stack.processing, stack.target, owner);

    // フィールドに出たユニットを破壊する
    Effect.break(stack, stack.processing, stack.target);
  },
};
