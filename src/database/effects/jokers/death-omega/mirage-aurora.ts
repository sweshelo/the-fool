import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.candidate(core, unit => unit.owner.id === player.id, player).length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === owner.id,
      owner
    );

    await System.show(stack, 'ミラージュ・アウローラ', 'ブロックされない');

    // 自分のユニットを1体選ぶ
    const [target] = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
      '「ブロックされない」効果を与えるユニットを選択'
    );

    // 「ブロックされない」効果を与える
    Effect.keyword(stack, stack.processing, target, '次元干渉', { cost: 0 });
  },
};
