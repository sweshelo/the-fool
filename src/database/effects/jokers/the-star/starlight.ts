import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.isUnitSelectable(
      core,
      (unit: Unit) => unit.owner.id !== player.id && unit.catalog.cost <= 5,
      player
    );
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const filter = (unit: Unit) => unit.owner.id !== owner.id && unit.catalog.cost <= 5;

    await System.show(stack, 'スターライト', '手札に戻す');

    // 対戦相手のコスト5以下のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(stack, owner, filter, '手札に戻すユニットを選択');

    // 手札に戻す
    Effect.bounce(stack, stack.processing, target, 'hand');
  },
};
