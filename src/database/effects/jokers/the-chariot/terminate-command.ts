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

    await System.show(stack, 'ターミネートコマンド', '【貫通】付与\n基本BP+2000');

    // 自分のユニットを2体まで選ぶ
    const selectedCount = Math.min(2, candidates.length);
    const targets = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
      '強化するユニットを選択',
      selectedCount
    );

    // 選んだユニットに【貫通】を与え、基本BPを+2000する
    targets.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '貫通');
      Effect.modifyBP(stack, stack.processing, unit, 2000, { isBaseBP: true });
    });
  },
};
