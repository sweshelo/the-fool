import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const filter = (unit: Unit) => unit.lv >= 2 && unit.owner.id !== stack.processing.owner.id;
    if (!EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) return;

    await System.show(stack, '冷酷なる裁き', `レベル2以上のユニットを1体破壊`);
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '破壊するユニットを選択して下さい'
    );
    Effect.break(stack, stack.processing, target, 'effect');
  },

  // 破壊時効果：手札に戻る
  onBreakSelf: async (stack: StackWithCard) => {
    if (stack.processing instanceof Unit) {
      await System.show(stack, '冷酷なる裁き', '手札に戻す');
      Effect.bounce(stack, stack.processing, stack.processing, 'hand');
    }
  },

  // オーバークロック時効果：選択肢
  onOverclockSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const choice = await EffectHelper.choice(
      stack,
      stack.processing.owner,
      '選略・ジャッジガベル',
      [
        { id: '1', description: 'BP+5000' },
        { id: '2', description: 'インターセプトカードを1枚引く' },
      ]
    );

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・ジャッジガベル', 'BP+5000');
        const allUnits = [...owner.field, ...owner.opponent.field];
        allUnits.forEach(unit => {
          Effect.modifyBP(stack, stack.processing, unit, 5000, { event: 'turnEnd', count: 1 });
        });
        break;
      }
      case '2': {
        await System.show(stack, '選略・ジャッジガベル', 'インターセプトカードを1枚引く');
        // デッキからインターセプトカードを1枚手札に加える
        EffectTemplate.reinforcements(stack, owner, { type: ['intercept'] });
        break;
      }
    }
  },
};
