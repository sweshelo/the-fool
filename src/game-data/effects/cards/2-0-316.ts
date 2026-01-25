import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // １：対戦相手のユニットからランダムで2体のレベルを+1する
    // ２：あなたのフィールドに青属性ユニットが2体以上いる場合、対戦相手のレベル2以上のユニットをランダムで1体破壊する。
    const choice = await EffectHelper.choice(stack, owner, '選略・竜胆の舞', [
      {
        id: '1',
        description: '相手ユニット2体のレベル+1',
        condition: () => opponent.field.length > 0,
      },
      {
        id: '2',
        description: 'レベル2以上のユニットを破壊',
        condition: () =>
          owner.field.filter(unit => unit.catalog.color === Color.BLUE).length >= 2 &&
          opponent.field.some(unit => unit.lv >= 2),
      },
    ]);

    switch (choice) {
      case '1':
        await System.show(stack, '選略・竜胆の舞', '相手ユニット2体のレベル+1');
        EffectHelper.random(opponent.field, 2).forEach(unit =>
          Effect.clock(stack, stack.processing, unit, 1)
        );
        break;
      case '2': {
        await System.show(stack, '選略・竜胆の舞', 'レベル2以上のユニットを破壊');
        const targets = opponent.field.filter(unit => unit.lv >= 2);
        const [target] = EffectHelper.random(targets);
        if (target instanceof Unit) {
          Effect.break(stack, stack.processing, target);
        }
        break;
      }
    }
  },
};
