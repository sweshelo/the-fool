import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.candidate(core, unit => unit.owner.id === player.id, player).length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === owner.id,
      owner
    );

    await System.show(stack, 'スプレンドシックル', 'レベル+1');

    // 自分のユニットを2体まで選ぶ
    const selectedCount = Math.min(2, candidates.length);
    const targets = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
      'レベルを上げるユニットを選択',
      selectedCount
    );

    // 選んだユニットのレベルを+1する
    targets.forEach(unit => {
      Effect.clock(stack, stack.processing, unit, 1);
    });
  },
};
