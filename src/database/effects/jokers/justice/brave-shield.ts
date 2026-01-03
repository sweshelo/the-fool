import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    // 行動済みのユニットが存在するか確認
    return (
      EffectHelper.candidate(core, unit => !unit.active && unit.owner.id === player.id, player)
        .length > 0
    );
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    // 行動済みのユニットのみを選択対象にする
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => !unit.active && unit.owner.id === stack.processing.owner.id,
      stack.processing.owner
    );

    await System.show(stack, 'ブレイブシールド', '行動権回復');

    // 自分のユニットを1体選ぶ
    const [target] = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
      '行動権を回復するユニットを選択'
    );

    // 行動権を回復する
    Effect.activate(stack, stack.processing, target, true);
  },
};
