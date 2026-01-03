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

    await System.show(stack, 'インサイトストライフ', '【スピードムーブ】付与');

    // 自分のユニットを1体選ぶ
    const [target] = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
      '【スピードムーブ】を与えるユニットを選択'
    );

    // 【スピードムーブ】を与える
    Effect.speedMove(stack, target);
  },
};
