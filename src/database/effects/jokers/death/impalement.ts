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
      unit => unit.owner.id !== owner.id,
      owner
    );

    await System.show(stack, 'インペイルメント', '10000ダメージ');

    // 対戦相手のユニットを１体選ぶ
    const [target] = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
      'ダメージを与えるユニットを選択'
    );

    // 10000ダメージを与える
    Effect.damage(stack, stack.processing, target, 10000);
  },
};
