import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { StackWithCard } from '../schema/types';

export const effects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    if (!(stack.target instanceof Unit)) return false;

    const isOpponentUnit = stack.target.owner.id !== stack.processing.owner.id;
    const onField =
      stack.processing.owner.opponent.field.find(unit => unit.id === stack.target?.id) ?? false;
    const hasHand = stack.processing.owner.hand.length > 0;
    return isOpponentUnit && onField && hasHand;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard) => {
    if (!(stack.target instanceof Unit)) return;
    await System.show(
      stack,
      'デストラクションスピア',
      '手札を1枚選んで捨てる\nユニットを破壊\n1ライフダメージ'
    );

    const [sacrifice] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      stack.processing.owner.hand,
      '捨てるカードを選んで下さい'
    );
    Effect.break(stack, stack.processing, stack.target);
    Effect.handes(stack, stack.processing, sacrifice);
    stack.processing.owner.damage(true);
  },
};
