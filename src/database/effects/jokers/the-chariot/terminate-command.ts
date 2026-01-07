import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.isUnitSelectable(core, 'owns', player);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    await System.show(stack, 'ターミネートコマンド', '【貫通】付与\n基本BP+2000');

    // 自分のユニットを2体まで選ぶ
    const targets = await EffectHelper.pickUnit(stack, owner, 'owns', '強化するユニットを選択', 2);

    // 選んだユニットに【貫通】を与え、基本BPを+2000する
    targets.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '貫通');
      Effect.modifyBP(stack, stack.processing, unit, 2000, { isBaseBP: true });
    });
  },
};
