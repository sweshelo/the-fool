import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnStart: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const isOpponentTurn = owner.id !== stack.source.id;
    const isOnField = owner.field.length > 0;

    return (
      isOpponentTurn &&
      isOnField &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    const maxCount = stack.processing.lv === 3 ? 3 : 2;

    await System.show(stack, '人身御供', `味方全体を消滅\n敵${maxCount}体を選び消滅`);

    // ユニットの選択を実施する
    const selection: Unit[] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '消滅させるユニットを選択',
      maxCount
    );

    [...stack.processing.owner.field, ...selection].forEach(unit =>
      Effect.delete(stack, stack.processing, unit)
    );
  },
};
