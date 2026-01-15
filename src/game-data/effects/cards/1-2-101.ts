import { Unit } from '@/package/core/class/card';
import { Effect } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  // ■アツアツの巨大肉
  // あなたのユニットがアタックした時、ターン終了時までそれのBPを+3000する。あなたの全てのユニットに1000ダメージを与える。
  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id) {
      await System.show(stack, 'アツアツの巨大肉', 'BP+3000\n味方全体に1000ダメージ');

      // アタックしたユニットにBP+3000をターン終了時まで付与
      Effect.modifyBP(stack, stack.processing, stack.target, 3000, {
        event: 'turnEnd',
        count: 1,
      });

      // 自分の全てのユニットに1000ダメージを与える
      for (const unit of stack.processing.owner.field) {
        Effect.damage(stack, stack.processing, unit, 1000, 'effect');
      }
    }
  },

  // ■巨大肉に大やけど
  // このユニットがフィールドでレベル3にクロックアップした時、全てのレベル1以下のユニットに5000ダメージを与える。
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.lv === 3) {
      const allUnits = stack.core.players.flatMap(p => p.field);
      const targets = allUnits.filter(unit => unit.lv <= 1);

      if (targets.length > 0) {
        await System.show(stack, '巨大肉に大やけど', 'レベル1以下に5000ダメージ');

        for (const unit of targets) {
          Effect.damage(stack, stack.processing, unit, 5000, 'effect');
        }
      }
    }
  },
};
