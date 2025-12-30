import { Delta } from '@/package/core/class/delta';
import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

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
      Effect.modifyBP(stack, stack.processing, unit, -Math.floor(unit.bp / 2), {
        isBaseBP: true,
      });
    });

    Effect.keyword(stack, stack.processing, stack.processing, '不屈');
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
  },

  // 手札のこのカードのコスト減少
  handEffect: (_core: unknown, self: Unit) => {
    const delta = self.delta.find(delta => delta.source?.unit === self.id);
    const handCount = self.owner.hand.length;
    const reduce = Math.max(-handCount, -self.catalog.cost + 4);

    if (delta && delta.effect.type === 'cost') {
      delta.effect.value = reduce;
    } else {
      self.delta.push(
        new Delta(
          { type: 'cost', value: reduce },
          {
            source: {
              unit: self.id,
            },
          }
        )
      );
    }
  },
};
