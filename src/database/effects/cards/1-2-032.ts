import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【呪縛】の付与とフィールド出現時効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 【呪縛】キーワード能力の付与
    // 封印されし魔人：行動権を消費
    await System.show(stack, '封印されし魔人', '行動権を消費');
    Effect.activate(stack, stack.processing, stack.processing, false);
    Effect.keyword(stack, stack.processing, stack.processing, '呪縛');
  },

  // 永久の呪縛：ターン開始時に行動権を消費
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン開始時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await System.show(stack, '永久の呪縛', '行動権を消費');
      Effect.activate(stack, stack.processing, stack.processing, false);
    }
  },

  // 劣化した魔術鉄鎖：効果によって対戦相手が手札を捨てた時に行動権を回復
  onHandes: async (stack: StackWithCard<Unit>): Promise<void> => {
    // targetとsourceがCardオブジェクトであることを確認
    if (!(stack.source instanceof Unit && stack.target instanceof Unit)) {
      return;
    }

    // 対戦相手が手札を捨てた時に発動
    const isOpponentCard = stack.target.owner.id === stack.processing.owner.opponent.id;
    const isEffectHandes = stack.source.owner.id === stack.processing.owner.id;

    if (isOpponentCard && isEffectHandes && !stack.processing.active) {
      await System.show(stack, '劣化した魔術鉄鎖', '行動権を回復');
      Effect.activate(stack, stack.processing, stack.processing, true);
    }
  },
};
