import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    return (
      stack.processing.owner.id === stack.source.id &&
      stack.processing.owner.opponent.trigger.length > 0
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'セレクトショップ', 'トリガーゾーンを公開\n1枚選んで破壊');
    const [target] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      stack.processing.owner.opponent.trigger,
      '破壊するカードを選択して下さい'
    );
    Effect.move(stack, stack.processing, target, 'trash');
  },
};
