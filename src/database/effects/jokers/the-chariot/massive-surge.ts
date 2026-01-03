import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    return player.field.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    if (owner.field.length === 0) return;

    await System.show(stack, 'マッシヴサージ', '基本BP+5000\n【不屈】付与');

    // 自分の全てのユニットの基本BPを+5000し、【不屈】を与える
    owner.field.forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, 5000, { isBaseBP: true });
      Effect.keyword(stack, stack.processing, unit, '不屈');
    });
  },
};
