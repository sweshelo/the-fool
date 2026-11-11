import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // 【不屈】【貫通】（召喚時付与）
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // ■ダブルインパクト
    const myUnits = stack.processing.owner.field;
    const opponentUnits = stack.processing.owner.opponent.field;

    await System.show(
      stack,
      '牙将の指揮＆ダブルインパクト',
      '【不屈】\n【貫通】\n味方全体の基本BPを2倍\n敵全体の基本BPを1/2'
    );

    // 味方全体の基本BPを2倍にする（基本BPと同じ値を追加）
    myUnits.forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, unit.bp, { isBaseBP: true });
    });

    // 敵全体の基本BPを1/2にする（基本BPの半分を減算）
    opponentUnits.forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, -(unit.bp / 2), {
        isBaseBP: true,
      });
    });

    Effect.keyword(stack, stack.processing, stack.processing, '不屈');
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
  },

  // 手札のこのカードのコスト減少
  handEffect: (_core: unknown, self: Unit) => {
    PermanentEffect.mount(self, {
      effect: (target, source) =>
        Effect.dynamicCost(target, {
          source,
          calculator: card => -card.owner.hand.length,
        }),
      effectCode: '牙将の指揮',
      targets: ['self'],
    });
  },
};
