import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■遊覧飛行
  // あなたのユニットがフィールドに出た時、それの行動権を消費し、「ブロックされない」効果を与える。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のユニットが出た時のみ発動
    return stack.source.id === owner.id && stack.target instanceof Unit;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;

    await System.show(stack, '遊覧飛行', '行動権を消費\nブロックされない');

    // 行動権を消費
    Effect.activate(stack, stack.processing, stack.target, false);

    // 「ブロックされない」効果を与える（次元干渉/コスト0として実装）
    Effect.keyword(stack, stack.processing, stack.target, '次元干渉', { cost: 0 });
  },
};
