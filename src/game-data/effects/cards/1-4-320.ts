import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 【秩序の盾】を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '秩序の盾', '相手の効果によるダメージを受けない');
    Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
  },

  // ■災厄の箱: 対戦相手のターン開始時、対戦相手の全てのユニットの基本BPを-1000する
  // ■禁忌の報い: あなたのターン開始時、このユニットの基本BPを-2000する
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const turnPlayer = stack.core.getTurnPlayer();

    if (turnPlayer.id === owner.opponent.id) {
      // 対戦相手のターン開始時
      if (owner.opponent.field.length > 0) {
        await System.show(stack, '災厄の箱', '敵全体の基本BP-1000');
        owner.opponent.field.forEach(unit => {
          Effect.modifyBP(stack, stack.processing, unit, -1000, { isBaseBP: true });
        });
      }
    } else if (turnPlayer.id === owner.id) {
      // 自分のターン開始時
      await System.show(stack, '禁忌の報い', '自身の基本BP-2000');
      Effect.modifyBP(stack, stack.processing, stack.processing, -2000, { isBaseBP: true });
    }
  },

  // ■残された希望: このユニットが破壊された時、あなたのCPを+1する
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '残された希望', 'CP+1');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
  },
};
