import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // アタッカー：アタック時にBP+2000
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'アタッカー', 'BP+2000');
    Effect.modifyBP(stack, stack.processing, stack.processing, 2000, {
      event: 'turnEnd',
      count: 1,
    });
  },

  // 飽くなき向上心：プレイヤーアタック成功時にレベル+1
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '飽くなき向上心', 'レベル+1');
    Effect.clock(stack, stack.processing, stack.processing, 1);
  },

  // 連撃の鎖：オーバークロック時に相手ユニットに【防御禁止】
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    const targets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === opponent.id,
      stack.processing.owner
    );

    if (targets.length > 0) {
      await System.show(stack, '連撃の鎖', '【防御禁止】付与');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        targets,
        '【防御禁止】を与えるユニットを選択'
      );
      Effect.keyword(stack, stack.processing, target, '防御禁止');
    }
  },
};
