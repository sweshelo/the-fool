import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のフィールドを取得
    const opponentUnits = stack.processing.owner.opponent.field;
    if (opponentUnits.length === 0) return;

    const choice = await EffectHelper.choice(
      stack,
      stack.processing.owner,
      '選略・空間を統べる覇者',
      [
        {
          id: '1',
          description: '敵全体のレベル3以上のユニットを破壊',
          condition: opponentUnits.filter(unit => unit.lv >= 3).length > 0,
        },
        { id: '2', description: '敵全体に【沈黙】を与える' },
      ]
    );

    switch (choice) {
      case '1': {
        // ①：対戦相手の全てのレベル3以上のユニットを破壊する
        const level3OrHigherUnits = opponentUnits.filter(unit => unit.lv >= 3);

        if (level3OrHigherUnits.length > 0) {
          await System.show(stack, '選略・空間を統べる覇者', '敵全体のLv3以上のユニットを破壊');

          for (const unit of level3OrHigherUnits) {
            Effect.break(stack, stack.processing, unit);
          }
        }
        break;
      }
      case '2': {
        // ②：対戦相手の全てのユニットに【沈黙】を与える
        if (opponentUnits.length > 0) {
          await System.show(stack, '選略・空間を統べる覇者', '敵全体に【沈黙】を与える');

          for (const unit of opponentUnits) {
            Effect.keyword(stack, stack.processing, unit, '沈黙');
          }
        }
        break;
      }
    }
  },
};
