import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.opponent.field.length > 0) {
      await System.show(
        stack,
        '秩序の盾＆モータルテリトリー',
        '対戦相手の効果によるダメージを受けない\n敵全体の基本BP-1000'
      );
      stack.processing.owner.opponent.field.forEach(unit =>
        Effect.modifyBP(stack, stack.processing, unit, -1000, { isBaseBP: true })
      );
    } else {
      await System.show(stack, '秩序の盾', '対戦相手の効果によるダメージを受けない');
    }
    Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
  },

  onTurnEnd: async (stack: StackWithCard<Unit>) => {
    if (stack.source.id === stack.processing.owner.id) {
      await System.show(stack, 'ヴィクトリーロード', '味方全体の基本BP+1000\nCP+1');
      stack.processing.owner.field.forEach(unit =>
        Effect.modifyBP(stack, stack.processing, unit, 1000, { isBaseBP: true })
      );
      Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
    }
  },
};
