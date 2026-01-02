import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import { Delta } from '@/package/core/class/delta';
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

    await System.show(stack, '極意・シュヴァリエドゥーク', '2体まで手札戻す\nコスト-2');

    // 自分のユニットを2体まで手札に戻す
    const selectedCount = Math.min(2, candidates.length);
    const targets = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
      '手札に戻すユニットを選択',
      selectedCount
    );

    targets.forEach(unit => {
      // 手札に戻す
      Effect.bounce(stack, stack.processing, unit, 'hand');

      // コストを-2する
      unit.delta.push(new Delta({ type: 'cost', value: -2 }));
    });
  },
};
