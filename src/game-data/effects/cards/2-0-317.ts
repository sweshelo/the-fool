import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のフィールドを取得
    const opponentUnits = stack.processing.owner.opponent.field;
    if (opponentUnits.length === 0) return;

    const [choice] =
      opponentUnits.filter(unit => unit.lv >= 3).length > 0
        ? await System.prompt(stack, stack.processing.owner.id, {
            title: '選略・空間を統べる覇者',
            type: 'option',
            items: [
              { id: '1', description: '敵全体のレベル3以上のユニットを破壊' },
              { id: '2', description: '敵全体に【沈黙】を与える' },
            ],
          })
        : ['2'];

    if (choice === '1') {
      // ①：対戦相手の全てのレベル3以上のユニットを破壊する
      const level3OrHigherUnits = opponentUnits.filter(unit => unit.lv >= 3);

      if (level3OrHigherUnits.length > 0) {
        await System.show(stack, '選略・空間を統べる覇者', '敵全体のLv3以上のユニットを破壊');

        for (const unit of level3OrHigherUnits) {
          Effect.break(stack, stack.processing, unit);
        }
      }
    } else if (choice === '2') {
      // ②：対戦相手の全てのユニットに【沈黙】を与える
      if (opponentUnits.length > 0) {
        await System.show(stack, '選略・空間を統べる覇者', '敵全体に【沈黙】を与える');

        for (const unit of opponentUnits) {
          Effect.keyword(stack, stack.processing, unit, '沈黙');
        }
      }
    }
  },
};
