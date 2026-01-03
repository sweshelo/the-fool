import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■ナカマガ、フエルヨ！
  // あなたのターン終了時、あなたのフィールドにユニットが4体以下の場合、あなたのフィールドに［メカだっくん］を1体【特殊召喚】する。
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のターン終了時であり、フィールドのユニットが4体以下の場合
    if (owner.id === stack.core.getTurnPlayer().id && owner.field.length <= 4) {
      await System.show(stack, 'ナカマガ、フエルヨ！', '［メカだっくん］を特殊召喚');

      // PR-135（メカだっくん）のカードを生成して特殊召喚
      // カードIDを直接指定して新しいユニットを生成
      const unit = new Unit(owner, 'PR-135');

      // 特殊召喚
      await Effect.summon(stack, stack.processing, unit);
    }
  },

  // ■ミンナ、マタネ！
  // 対戦相手のターン時、このユニットが効果によって破壊された時、捨札に送られる代わりにあなたの手札に戻る。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のターン中かつ効果によって破壊された場合
    if (stack.core.getTurnPlayer().id === opponent.id && EffectHelper.isBreakByEffect(stack)) {
      await System.show(stack, 'ミンナ、マタネ！', '手札に戻る');

      // 捨札に送られる前にこの処理がフックされ、手札に戻す
      Effect.move(stack, stack.processing, stack.processing, 'hand');
    }
  },

  // ■レーザーシックル
  // このユニットがオーバークロックした時、対戦相手に1ライフダメージを与える。
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    await System.show(stack, 'レーザーシックル', '1ライフダメージ');

    // 対戦相手に1ライフダメージ
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },
};
