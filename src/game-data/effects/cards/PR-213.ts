import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    const isSelectable =
      EffectHelper.isUnitSelectable(
        stack.core,
        (unit: Unit) => unit.owner.id === stack.processing.owner.id,
        stack.processing.owner
      ) &&
      EffectHelper.isUnitSelectable(
        stack.core,
        (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id,
        stack.processing.owner
      );
    const isOwnUnitDriven = stack.source.id === stack.processing.owner.id;

    return isSelectable && isOwnUnitDriven;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '終わらない戦い', '【狂戦士】と【強制防御】を与える');

    [
      ...(await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'owns',
        '【狂戦士】【強制防御】を与えるユニットを選択'
      )),
      ...(await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        '【狂戦士】【強制防御】を与えるユニットを選択'
      )),
    ].forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '強制防御');
      Effect.keyword(stack, stack.processing, unit, '狂戦士');
    });
  },
};
