import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    // 相手トリガーゾーンのカードを1枚ランダムで破壊
    const opponentTrigger = stack.processing.owner.opponent.trigger;
    if (opponentTrigger.length > 0) {
      await System.show(
        stack,
        '消滅効果耐性＆トリガーロスト',
        '対戦相手の効果によって消滅しない\nトリガーゾーンを1枚破壊'
      );
      const [target] = EffectHelper.random(opponentTrigger, 1);
      if (target) {
        Effect.move(stack, stack.processing, target, 'trash');
      }
    } else {
      await System.show(stack, '消滅効果耐性', '対戦相手の効果によって消滅しない');
    }
    // 【消滅効果耐性】を自身に付与
    Effect.keyword(stack, stack.processing, stack.processing, '消滅効果耐性');
  },

  // アタック時効果
  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    // 自分フィールドの【巨人】数をカウント
    const giantCount = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('巨人')
    ).length;
    if (giantCount === 0) return;
    // 相手フィールドの全ユニット
    const targets = stack.processing.owner.opponent.field;
    if (targets.length === 0) return;
    await System.show(stack, '終焉の劫火', '敵全体に[【巨人】×1000]ダメージ');
    for (const unit of targets) {
      Effect.damage(stack, stack.processing, unit, giantCount * 1000);
    }
  },
};
