import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';
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
