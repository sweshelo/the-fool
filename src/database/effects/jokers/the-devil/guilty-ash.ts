import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    const opponent = player.opponent;
    return opponent.trigger.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    if (opponent.trigger.length === 0) return;

    await System.show(stack, 'ギルティアッシュ', 'トリガー公開\n1枚破壊');

    // 対戦相手はトリガーゾーンを公開する
    // プレイヤーがトリガーゾーンのカードを1枚選んで破壊する
    const [target] = await EffectHelper.selectCard(
      stack,
      owner,
      opponent.trigger,
      '破壊するカードを選択'
    );

    Effect.handes(stack, stack.processing, target);
  },
};
