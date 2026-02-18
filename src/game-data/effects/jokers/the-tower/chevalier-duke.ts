import { System } from '../../engine/system';
import { EffectHelper } from '../../engine/helper';
import { Effect } from '../../engine/effect';
import { Delta } from '@/package/core/class/delta';
import type { CardEffects, StackWithCard } from '../../schema/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.isUnitSelectable(core, 'owns', player);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    await System.show(stack, '極意・シュヴァリエドゥーク', '2体まで手札戻す\nコスト-2');

    // 自分のユニットを2体まで手札に戻す
    const targets = await EffectHelper.pickUnit(
      stack,
      owner,
      'owns',
      '手札に戻すユニットを選択',
      2
    );

    targets.forEach(unit => {
      // 手札に戻す
      Effect.bounce(stack, stack.processing, unit, 'hand');

      // コストを-2する
      unit.delta.push(new Delta({ type: 'cost', value: -2 }, { permanent: true }));
    });
  },
};
