import { System } from '../../classes/system';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    const opponent = player.opponent;
    // レベル2以上のユニットが存在するか確認
    return opponent.field.some((unit: Unit) => unit.lv >= 2);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // レベル2以上のユニットをフィルタリング
    const targets = opponent.field.filter((unit: Unit) => unit.lv >= 2);

    if (targets.length === 0) return;

    await System.show(stack, '月花熾滅', '敵全体のLv2以上のユニットを破壊する');

    // 対戦相手のレベル2以上のユニットを全て破壊する
    targets.forEach((unit: Unit) => {
      Effect.break(stack, stack.processing, unit);
    });
  },
};
