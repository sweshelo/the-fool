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
    const opponent = owner.opponent;
    const filter = (unit: Unit) => unit.owner.id !== owner.id;

    await System.show(stack, 'エイミングクラッシュ', '【強制防御】付与\nCP+1');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      filter,
      '【強制防御】を与えるユニットを選択'
    );

    // 【強制防御】を与える
    Effect.keyword(stack, stack.processing, target, '強制防御');

    // お互いのプレイヤーのCPを+1する
    Effect.modifyCP(stack, stack.processing, owner, 1);
    Effect.modifyCP(stack, stack.processing, opponent, 1);
  },
};
