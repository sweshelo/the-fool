import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.candidate(core, unit => unit.owner.id !== player.id, player).length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    await System.show(stack, 'スプレッド・インフェルノ', '5000ダメージ\n2000ダメージ');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
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
