import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■アタッカー
  // このユニットがアタックした時、ターン終了時までこのユニットのBPを+2000する。
  async onAttackSelf(stack: StackWithCard<Unit>) {
    await System.show(stack, 'アタッカー', 'BP+2000');
    Effect.modifyBP(stack, stack.processing, stack.processing, 2000, {
      event: 'turnEnd',
      count: 1,
    });
  },

  // ■飽くなき向上心
  // このユニットがプレイヤーアタックに成功した時、このユニットのレベルを+1する。
  async onPlayerAttackSelf(stack: StackWithCard<Unit>) {
    await System.show(stack, '飽くなき向上心', 'レベル+1');
    Effect.clock(stack, stack.processing, stack.processing, 1);
  },

  // ■連撃の鎖
  // このユニットがオーバークロックした時、対戦相手のユニットを1体選ぶ。それに【防御禁止】を与える。
  async onOverclockSelf(stack: StackWithCard<Unit>) {
    const opponent = stack.processing.owner.opponent;
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === opponent.id,
      stack.processing.owner
    );

    if (candidates.length > 0) {
      await System.show(stack, '連撃の鎖', '【防御禁止】を付与');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidates,
        '対戦相手のユニットを1体選んでください'
      );

      Effect.keyword(stack, stack.processing, target, '防御禁止', {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
