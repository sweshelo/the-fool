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
    const opponent = owner.opponent;
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== owner.id,
      owner
    );

    await System.show(stack, 'エイミングクラッシュ', '【強制防御】付与\nCP+1');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
      '【強制防御】を与えるユニットを選択'
    );

    // 【強制防御】を与える
    Effect.keyword(stack, stack.processing, target, '強制防御');

    // お互いのプレイヤーのCPを+1する
    Effect.modifyCP(stack, stack.processing, owner, 1);
    Effect.modifyCP(stack, stack.processing, opponent, 1);
  },
};
