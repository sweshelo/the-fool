import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    // 行動済みのユニットが存在するか確認
    return player.field.some(unit => !unit.active);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    await System.show(stack, 'ディバインシールド', '味方全体の行動権を回復');

    // 自分の全てのユニットの行動権を回復する
    owner.field.forEach(unit => {
      Effect.activate(stack, stack.processing, unit, true);
    });
  },
};
