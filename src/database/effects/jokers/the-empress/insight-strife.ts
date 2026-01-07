import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.isUnitSelectable(core, 'owns', player);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    await System.show(stack, 'インサイトストライフ', '【スピードムーブ】を与える');

    // 自分のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'owns',
      '【スピードムーブ】を与えるユニットを選択'
    );

    // 【スピードムーブ】を与える
    Effect.speedMove(stack, target);
  },
};
