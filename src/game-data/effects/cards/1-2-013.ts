import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  //■宴もたけなわ
  //あなたのターン終了時、このユニットのレベルを+1する。
  //■泥酔爆音頭
  //このユニットがクロックアップするたび、対戦相手のユニットからランダムで1体に5000ダメージを与える。

  onTurnEnd: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const turnPlayer = stack.core.getTurnPlayer();

    if (turnPlayer.id !== self.owner.id || self.lv >= 3) return;

    await System.show(stack, '宴もたけなわ', 'レベル+1');

    Effect.clock(stack, self, self, 1);
  },

  onClockupSelf: async (stack: StackWithCard<Unit>) => {
    const opponent = stack.processing.owner.opponent;

    // 相手のユニットが0体なら何もしない
    if (opponent.field.length === 0) return;

    await System.show(stack, '泥酔爆音頭', 'ランダムなユニット1体に5000ダメージ');

    // ランダムに1体選択
    const target = EffectHelper.random(opponent.field, 1);

    // 5000ダメージを与える
    target.forEach(unit => Effect.damage(stack, stack.processing, unit, 5000));
  },
};
