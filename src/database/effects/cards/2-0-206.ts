import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';
import { EffectHelper } from '../classes/helper';

export const effects: CardEffects = {
  onTurnStart: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing as Unit;
    const owner = self.owner;

    if (stack.core.getTurnPlayer().id === owner.id) {
      const candidate = EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id === owner.opponent.id,
        owner
      );

      // 手札が7枚の場合
      if (owner.hand.length === 7 && candidate.length > 0) {
        await System.show(stack, 'かほうはねてまて♪', '手札に戻す');

        // 対戦相手のフィールドのユニットを選択
        const [target] = await EffectHelper.selectUnit(
          stack,
          owner,
          candidate,
          '手札に戻すユニットを選択して下さい',
          1
        );
        if (target) {
          Effect.bounce(stack, self, target, 'hand');
        }
      }
    } else {
      const opponent = self.owner.opponent;
      // 対戦相手の手札が7枚の場合
      if (opponent.hand.length === 7) {
        await System.show(stack, 'かほうはねてまて♪', '手札を1枚破壊');

        // ランダムで1枚捨てる
        const [card] = EffectHelper.random(opponent.hand, 1);
        if (card) {
          Effect.handes(stack, self, card);
        }
      }
    }
  },
};
