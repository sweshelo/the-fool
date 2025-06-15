import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    // トリガーゾーンのカード数を取得
    const triggerCount = stack.processing.owner.trigger.length;
    if (triggerCount === 0 || stack.processing.owner.opponent.field.length === 0) return;

    await System.show(
      stack,
      '猛り狂う巨竜',
      '[トリガーゾーン×1000]ダメージ\n基本BP+[トリガーゾーン×1500]'
    );

    // ダメージ量とBP上昇量を計算
    const damage = triggerCount * 1000;
    const bpBoost = triggerCount * 1500;

    // 相手の全ユニットにダメージを与える
    for (const unit of stack.processing.owner.opponent.field) {
      Effect.damage(stack, stack.processing, unit, damage, 'effect');
    }

    // 自身のBPを上昇
    Effect.modifyBP(stack, stack.processing, stack.processing, bpBoost, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
