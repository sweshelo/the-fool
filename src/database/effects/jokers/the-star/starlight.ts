import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return (
      EffectHelper.candidate(
        core,
        unit => unit.owner.id !== player.id && unit.catalog.cost <= 5,
        player
      ).length > 0
    );
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== owner.id && unit.catalog.cost <= 5,
      owner
    );

    await System.show(stack, 'スターライト', '手札に戻す');

    // 対戦相手のコスト5以下のユニットを1体選ぶ
    const [target] = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
      '手札に戻すユニットを選択'
    );

    // 手札に戻す
    Effect.bounce(stack, stack.processing, target, 'hand');
  },
};
