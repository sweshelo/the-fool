import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // ジョカ以外にユニットがいるか
    if (owner.field.length === 1) return;

    // 相手のフィールドのユニット数
    const opponentUnits = opponent.field;
    const opponentMoreThanLv2Units = opponent.field.filter(unit => unit.lv >= 2);

    if (opponentUnits.length >= 4) {
      await System.show(stack, '惰世の黒冥球', '自身以外の全てのユニットを破壊');
      EffectHelper.exceptSelf(stack.core, stack.processing, (unit: Unit) =>
        Effect.break(stack, stack.processing, unit, 'effect')
      );
    } else {
      await System.show(
        stack,
        '惰世の黒冥球',
        `自身以外の味方ユニットを破壊${opponentMoreThanLv2Units.length > 0 ? '\n敵全体のLv2以上のユニットを破壊' : ''}`
      );
      [
        ...owner.field.filter(unit => unit.id !== stack.processing.id),
        ...opponentMoreThanLv2Units,
      ].forEach(unit => Effect.break(stack, stack.processing, unit, 'effect'));
    }
  },
};
