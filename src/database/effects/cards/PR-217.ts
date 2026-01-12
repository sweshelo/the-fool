import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■ぶくぶブブ襲来
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.name === '蠅魔王ベルゼブブ'
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const opponentUnits = stack.processing.owner.opponent.field;
    const [singleTarget] = opponentUnits;

    if (opponentUnits.length === 1 && singleTarget) {
      // 1体の場合は10000ダメージ
      await System.show(stack, 'ぶくぶブブ襲来', '10000ダメージ\n[蠅魔王ベルゼブブ]を手札に作成');
      Effect.damage(stack, stack.processing, singleTarget, 10000);
    } else if (opponentUnits.length >= 2) {
      // 2体以上の場合はランダムで2体に5000ダメージ
      await System.show(
        stack,
        'ぶくぶブブ襲来',
        'ランダムで2体に5000ダメージ\n[蠅魔王ベルゼブブ]を手札に作成'
      );
      const targets = EffectHelper.random(opponentUnits, 2);
      targets.forEach(target => {
        Effect.damage(stack, stack.processing, target, 5000);
      });
    } else {
      // 相手のユニットが0体の場合はカード作成のみ
      await System.show(stack, 'ぶくぶブブ襲来', '[蠅魔王ベルゼブブ]を手札に作成');
    }

    // 手札に蠅魔王ベルゼブブを1枚作成
    const newCard = new Unit(stack.processing.owner, '1-2-010');
    stack.processing.owner.hand.push(newCard);
  },
};
