import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.isUnitSelectable(core, (unit: Unit) => unit.owner.id !== player.id, player);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;

    await System.show(stack, 'スプレッド・インフェルノ', '5000ダメージ\n2000ダメージ');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      filter,
      '5000ダメージを与えるユニットを選択'
    );

    // 選んだユニットに5000ダメージを与える
    Effect.damage(stack, stack.processing, target, 5000);

    // 対戦相手の全てのユニットに2000ダメージを与える
    stack.processing.owner.opponent.field.forEach(unit => {
      Effect.damage(stack, stack.processing, unit, 2000);
    });
  },
};
