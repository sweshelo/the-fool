import { System } from '../../engine/system';
import { EffectHelper } from '../../engine/helper';
import { Effect } from '../../engine/effect';
import type { CardEffects, StackWithCard } from '../../schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    // 行動済みのユニットが存在するか確認
    return EffectHelper.isUnitSelectable(
      core,
      unit => !unit.active && unit.owner.id === player.id,
      player
    );
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    // 行動済みのユニットのみを選択対象にする
    const filter = (unit: Unit) => !unit.active && unit.owner.id === stack.processing.owner.id;

    await System.show(stack, 'ブレイブシールド', '行動権回復');

    // 自分のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      filter,
      '行動権を回復するユニットを選択'
    );

    // 行動権を回復する
    Effect.activate(stack, stack.processing, target, true);
  },
};
