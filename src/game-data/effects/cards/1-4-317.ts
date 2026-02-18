import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがプレイヤーアタックに成功した時
  onPlayerAttackSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    // 対戦相手よりあなたのライフが少ない場合
    if (owner.life.current < opponent.life.current) {
      // 対戦相手に追加で1ライフダメージを与える
      await System.show(stack, '土壇場の奮起', '1ライフダメージ');
      Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
    }
  },

  // このユニットがオーバークロックした時
  onOverclockSelf: async (stack: StackWithCard<Unit>) => {
    // あなたのCPを+2する
    await System.show(stack, '大地の恩寵', 'CP+2');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2);
  },
};
