import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【スピードムーブ】
  // ■紅蓮の弾舞
  // このユニットがフィールドに出た時、対戦相手のユニットを1体選ぶ。それに1000ダメージを与える。
  // ■威嚇突撃
  // このユニットがアタックした時、対戦相手のコスト2以下のユニットを1体選ぶ。それにターン終了時まで【防御禁止】（ブロックすることができない）を与える。

  // 召喚時にスピードムーブを付与し、対戦相手のユニットに1000ダメージを与える
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // スピードムーブを付与
    await System.show(stack, '紅蓮の弾舞', '【スピードムーブ】を付与');
    Effect.speedMove(stack, stack.processing);

    const opponent = stack.processing.owner.opponent;

    // 対戦相手のユニットを取得
    const opponentUnits = opponent.field;

    if (opponentUnits.length > 0) {
      await System.show(stack, '紅蓮の弾舞', '敵ユニット1体に1000ダメージ');

      // ユニットを1体選択
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        opponentUnits,
        '1000ダメージを与えるユニットを選択'
      );

      if (target) {
        // 1000ダメージを与える
        Effect.damage(stack, stack.processing, target, 1000);
      }
    }
  },

  // アタック時、対戦相手のコスト2以下のユニットに防御禁止を与える
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    // 対戦相手のコスト2以下のユニットをフィルタリング
    const lowCostUnits = opponent.field.filter(unit => unit.catalog.cost <= 2);

    if (lowCostUnits.length > 0) {
      await System.show(stack, '威嚇突撃', '【防御禁止】を付与');

      // ユニットを1体選択
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        lowCostUnits,
        '【防御禁止】を与えるユニットを選択'
      );

      if (target) {
        // 防御禁止を付与（ターン終了時まで）
        Effect.keyword(stack, stack.processing, target, '防御禁止', {
          event: 'turnEnd',
          count: 1,
        });
      }
    }
  },
};
