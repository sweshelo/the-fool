import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【秩序の盾】【固着】
  // ■森羅万象の理
  // このユニットがフィールドに出た時、対戦相手の全てのユニットの基本BPを-2000する。
  // ■安寧なる世のために
  // 対戦相手のユニットがアタックした時、それの基本BPを-1000する。
  // あなたのトリガーゾーンのカードが対戦相手の効果によって破壊された時、対戦相手のユニットを1体選ぶ。それの基本BPを-3000する。

  // 召喚時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    await System.show(stack, '森羅万象の理', '【秩序の盾】【固着】\n敵全体の基本BPを-2000');

    // キーワード能力を付与
    Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
    Effect.keyword(stack, stack.processing, stack.processing, '固着');

    // 相手全てのユニットの基本BPを-2000する
    for (const unit of opponent.field) {
      Effect.modifyBP(stack, stack.processing, unit, -2000, {
        isBaseBP: true,
      });
    }
  },

  // 相手ユニットがアタックした時の効果
  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 相手のユニットがアタックした時のみ発動
    if (stack.source instanceof Unit && stack.source.owner.id !== owner.id) {
      await System.show(stack, '安寧なる世のために', '敵の基本BPを-1000');

      // アタックしたユニットの基本BPを-1000する
      Effect.modifyBP(stack, stack.processing, stack.source, -1000, {
        isBaseBP: true,
      });
    }
  },

  // トリガーが破壊された時の効果
  onLost: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分のトリガーカードが相手の効果によって破壊された時のみ発動
    if (
      stack.source instanceof Unit &&
      stack.source.owner.id !== owner.id &&
      stack.target &&
      stack.target instanceof Unit &&
      stack.target.owner.id === owner.id
    ) {
      // 相手のユニットが存在する場合のみ処理
      if (opponent.field.length > 0) {
        // 対象を選択可能なユニットを取得
        const targetCandidates = EffectHelper.candidate(
          stack.core,
          unit => unit.owner.id === opponent.id,
          owner
        );

        if (targetCandidates.length > 0) {
          await System.show(stack, '安寧なる世のために', '敵の基本BPを-3000');

          // ユニットを1体選択
          const [target] = await EffectHelper.selectUnit(
            stack,
            owner,
            targetCandidates,
            '基本BPを-3000するユニットを選択'
          );

          // 基本BPを-3000する
          Effect.modifyBP(stack, stack.processing, target, -3000, {
            isBaseBP: true,
          });
        }
      }
    }
  },
};
