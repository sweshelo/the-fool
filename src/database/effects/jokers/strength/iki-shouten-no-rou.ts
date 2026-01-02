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

    await System.show(stack, '威気衝天の籠', '基本BP2倍\n【不屈】と【貫通】を付与');

    // 自分のユニットを1体選ぶ
    const [target] = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
      '強化するユニットを選択'
    );

    // 基本BPを2倍にする
    Effect.modifyBP(stack, stack.processing, target, target.bp, { isBaseBP: true });

    // 【不屈】と【貫通】を与える
    Effect.keyword(stack, stack.processing, target, '不屈');
    Effect.keyword(stack, stack.processing, target, '貫通');
  },
};
