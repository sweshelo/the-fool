import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // このユニットがアタックかブロックした時、あなたは1ライフダメージを受ける
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '永遠の命', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner, -1);
  },

  onBlockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '永遠の命', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner, -1);
  },

  // あなたのターン終了時、このユニットのレベルを-1する
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターンの終了時に発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await System.show(stack, '永久の苦しみ', 'レベル-1');
      Effect.clock(stack, stack.processing, stack.processing, -1);
    }
  },

  // このユニットがフィールドでレベル3にクロックアップした時、対戦相手の全てのユニットを消滅させる。このユニットを破壊する。
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // レベル3にクロックアップした時の処理
    if (stack.processing.lv === 3) {
      await System.show(stack, '終末の炎', '敵全体を消滅\n自身を破壊');

      // 対戦相手の全ユニットを取得
      const oppUnits = stack.processing.owner.opponent.field;

      // 全ての敵ユニットを消滅させる
      for (const unit of oppUnits) {
        Effect.delete(stack, stack.processing, unit);
      }

      // 自身を破壊する
      Effect.break(stack, stack.processing, stack.processing, 'effect');
    }
  },
};
