import { System } from '../../engine/system';
import { EffectHelper } from '../../engine/helper';
import { Effect } from '../../engine/effect';
import type { CardEffects, StackWithCard } from '../../schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.isUnitSelectable(core, (unit: Unit) => unit.owner.id === player.id, player);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const filter = (unit: Unit) => unit.owner.id === owner.id;

    await System.show(stack, 'スプレンドシックル', 'レベル+1');

    // 自分のユニットを2体まで選ぶ
    const targets = await EffectHelper.pickUnit(
      stack,
      owner,
      filter,
      'レベルを上げるユニットを選択',
      2
    );

    // 選んだユニットのレベルを+1する
    targets.forEach(unit => {
      Effect.clock(stack, stack.processing, unit, 1);
    });
  },
};
