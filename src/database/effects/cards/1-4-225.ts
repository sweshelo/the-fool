import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // らいおんぱわー！：フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のユニットを選び、強制防御を付与
    const targets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (targets.length > 0) {
      await System.show(stack, 'らいおんぱわー！', '【強制防御】を付与');

      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        targets,
        '【強制防御】を与えるユニットを選択'
      );

      Effect.keyword(stack, stack.processing, target, '強制防御', {
        event: 'turnEnd',
        count: 1,
      });
    }
  },

  // ターン開始時の効果
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン開始時に発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      // ラウンド数が奇数かチェック
      const roundNumber = stack.core.room.rule.system.round;

      if (roundNumber % 2 === 1) {
        // 奇数ラウンド
        const targets = EffectHelper.candidate(
          stack.core,
          unit => unit.owner.id === stack.processing.owner.opponent.id,
          stack.processing.owner
        );

        if (targets.length > 0) {
          await System.show(stack, 'らいおんぱわー！', '【強制防御】を付与');

          const [target] = await EffectHelper.selectUnit(
            stack,
            stack.processing.owner,
            targets,
            '【強制防御】を与えるユニットを選択'
          );

          Effect.keyword(stack, stack.processing, target, '強制防御');
        }
      }
    }
  },
};
