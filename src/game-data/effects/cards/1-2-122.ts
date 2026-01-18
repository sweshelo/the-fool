import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 【不屈】
  // ■バースト・カタストロフ
  // このユニットがフィールドに出た時、対戦相手のユニットを1体選ぶ。それの基本BPを1／2にする。
  // ■アームズ・バトルシフト
  // このユニットが戦闘した時、ターン終了時までこのユニットのBPを3倍にする。

  // 召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 不屈を付与
    Effect.keyword(stack, stack.processing, stack.processing, '不屈');

    // 対戦相手のユニットが存在するか確認
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, 'バースト・カタストロフ', '基本BPを1/2に');

      // 対象を1体選択
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'BPを1/2にするユニットを選択'
      );

      // 対象の基本BPを取得して半分に（端数切り上げ）
      const baseBP = target.bp;
      const halfBP = Math.ceil(baseBP / 2);
      const bpReduction = baseBP - halfBP; // 減少量を計算

      // BPを減少させる
      Effect.modifyBP(stack, stack.processing, target, -bpReduction, {
        isBaseBP: true,
      });
    }
  },

  // 戦闘時効果
  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自身のBPを取得
    const currentBP = stack.processing.currentBP;

    // 3倍のBP増加量を計算
    const bpIncrease = currentBP * 2; // 現在のBPに加えて2倍分増やす = 合計で3倍

    await System.show(stack, 'アームズ・バトルシフト', 'BP×3');

    // BPを増加（ターン終了まで）
    Effect.modifyBP(stack, stack.processing, stack.processing, bpIncrease, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
