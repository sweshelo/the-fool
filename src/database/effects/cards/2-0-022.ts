import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // ■連撃・豪熱の息吹
  // このユニットがフィールドに出た時、このターンにあなたがこのユニット以外のコスト2以上の緑属性のカードを使用している場合、
  // 対戦相手のユニットを1体選ぶ。それの基本BPを-5000する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 連撃条件確認: このターンにコスト2以上の緑属性のカードを使用しているか
    const hasUsedGreenCardThisTurn = stack.core.histories.some(
      history =>
        history.card.id !== stack.processing.id && // このユニット以外
        history.card.catalog.color === Color.GREEN && // 緑属性
        history.card.catalog.cost >= 2 // コスト2以上
    );

    // 対戦相手のユニットが存在するか確認
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    if (hasUsedGreenCardThisTurn && opponentUnits.length > 0) {
      await System.show(stack, '連撃・豪熱の息吹', '基本BP-5000');

      // 対象を1体選択
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        opponentUnits,
        '基本BPを-5000するユニットを選択'
      );

      // BPを-5000
      Effect.modifyBP(stack, stack.processing, target, -5000, {
        isBaseBP: true,
      });
    }
  },
};
