import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【不屈】キーワード能力付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '不屈', 'ターン終了時に行動権を回復');
    Effect.keyword(stack, stack.processing, stack.processing, '不屈', {
      source: { unit: stack.processing.id },
    });
  },

  // 平和の象徴：ターン開始時に行動権を消費
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン開始時
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await System.show(stack, '平和の象徴', '行動権を消費');
      Effect.activate(stack, stack.processing, stack.processing, false);
    }
  },

  // 争いの追憶：相手ターン終了時、レベル2以上でユニットを消滅
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 相手のターン終了時
    if (stack.processing.owner.id !== stack.core.getTurnPlayer().id) {
      // 自身のレベルが2以上の場合
      if (stack.processing.lv >= 2) {
        const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;

        if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
          await System.show(stack, '争いの追憶', 'ユニットを消滅');

          const [target] = await EffectHelper.pickUnit(
            stack,
            stack.processing.owner,
            filter,
            '消滅させるユニットを選択'
          );

          Effect.delete(stack, stack.processing, target);
        }
      }
    }
  },
};
