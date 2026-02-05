import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { GREEN_COMBO } from '../engine/helper/combo';

export const effects: CardEffects = {
  // ユニット: 連撃・翔翼乱舞
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // このターンにコスト2以上の緑属性のカードを使用しているかチェック
    const usedGreenCards = EffectHelper.combo(stack.core, stack.processing, GREEN_COMBO(2));

    if (usedGreenCards) {
      await System.show(stack, '連撃・翔翼乱舞', '味方全体の基本BP+1000\n敵全体の基本BP-1000');

      // 味方全体の基本BP+1000
      for (const unit of stack.processing.owner.field) {
        Effect.modifyBP(stack, stack.processing, unit, 1000, { isBaseBP: true });
      }

      // 敵全体の基本BP-1000
      for (const unit of stack.processing.owner.opponent.field) {
        Effect.modifyBP(stack, stack.processing, unit, -1000, { isBaseBP: true });
      }
    }
  },

  // ユニット: 大いなる旋回 - プレイヤーアタックに成功した時
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '大いなる旋回', '自身を手札に戻す\nCP+2');
    Effect.bounce(stack, stack.processing, stack.processing, 'hand');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2);
  },
};
