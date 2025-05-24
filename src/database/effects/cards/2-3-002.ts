import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■援軍／道化師
  // このユニットがフィールドに出た時、【道化師】ユニットのカードを1枚ランダムで手札に加える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '援軍／道化師', '【道化師】ユニットを1枚ランダムで手札に加える');

    // 援軍効果を実行
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      species: '道化師',
    });
  },

  // ■チクタクバーン
  // このユニットがプレイヤーアタックに成功した時、対戦相手の【防御禁止】の効果が発動しているユニットを1体選ぶ。
  // それに5000ダメージを与える。
  onPlayerAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    // 選択可能なユニットをチェック（防御禁止状態の相手ユニット）
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => (unit.owner.id === opponent.id && unit.hasKeyword('防御禁止') ? true : false),
      stack.processing.owner
    );

    if (candidates.length > 0) {
      await System.show(stack, 'チクタクバーン', '【防御禁止】の敵ユニット1体に5000ダメージ');

      try {
        // ユニットを選択
        const [selected] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          candidates,
          'ダメージを与えるユニットを選択'
        );

        // 選んだユニットに5000ダメージを与える
        Effect.damage(stack, stack.processing, selected, 5000);
      } catch (error) {
        console.error('ユニット選択エラー:', error);
      }
    }
  },
};
