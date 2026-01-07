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

    await System.show(stack, 'ミラージュ・アウローラ', 'ブロックされない');

    // 自分のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      filter,
      '「ブロックされない」効果を与えるユニットを選択'
    );

    // 「ブロックされない」効果を与える
    Effect.keyword(stack, stack.processing, target, '次元干渉', { cost: 0 });
  },
};
