import { System } from '../../engine/system';
import { EffectHelper } from '../../engine/helper';
import { Effect } from '../../engine/effect';
import type { CardEffects, StackWithCard } from '../../schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return (
      player.field.length > 0 &&
      EffectHelper.isUnitSelectable(core, (unit: Unit) => unit.owner.id === player.id, player)
    );
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    if (owner.field.length === 0) return;

    await System.show(stack, 'セイクリッドシールド', '基本BP+2000\n【加護】付与');

    // 自分のユニットを1体選ぶ
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;
    const [target] = await EffectHelper.pickUnit(stack, owner, filter, '強化するユニットを選択');

    // 基本BPを+2000する
    Effect.modifyBP(stack, stack.processing, target, 2000, { isBaseBP: true });

    // 【加護】を与える
    Effect.keyword(stack, stack.processing, target, '加護');
  },
};
