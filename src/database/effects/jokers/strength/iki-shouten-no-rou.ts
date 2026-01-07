import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.isUnitSelectable(core, (unit: Unit) => unit.owner.id === player.id, player);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const filter = (unit: Unit) => unit.owner.id === owner.id;

    await System.show(stack, '威気衝天の籠', '基本BP2倍\n【不屈】と【貫通】を付与');

    // 自分のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(stack, owner, filter, '強化するユニットを選択');

    // 基本BPを2倍にする
    Effect.modifyBP(stack, stack.processing, target, target.bp, { isBaseBP: true });

    // 【不屈】と【貫通】を与える
    Effect.keyword(stack, stack.processing, target, '不屈');
    Effect.keyword(stack, stack.processing, target, '貫通');
  },
};
