import { System } from '../../engine/system';
import { EffectHelper } from '../../engine/helper';
import { Effect } from '../../engine/effect';
import type { CardEffects, StackWithCard } from '../../schema/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.isUnitSelectable(core, 'opponents', player);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    await System.show(stack, 'スプレッド・インフェルノ', '5000ダメージ\n2000ダメージ');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '5000ダメージを与えるユニットを選択'
    );

    // 選んだユニットに5000ダメージを与える
    Effect.damage(stack, stack.processing, target, 5000);

    // 対戦相手の全てのユニットに2000ダメージを与える
    owner.opponent.field.forEach(unit => {
      Effect.damage(stack, stack.processing, unit, 2000);
    });
  },
};
