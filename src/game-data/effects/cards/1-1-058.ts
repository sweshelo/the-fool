import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■暗黒街の武器商人
  // あなたのターン終了時、あなたはカードを1枚引き、CPを+1する。
  // NOTE: トリガーカードのチェッカーを実装
  checkTurnEnd(stack: StackWithCard): boolean {
    const owner = stack.processing.owner;
    const turnPlayer = stack.core.getTurnPlayer();

    // 自分のターン終了時に発動
    return owner.id === turnPlayer.id;
  },

  async onTurnEnd(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;

    await System.show(stack, '暗黒街の武器商人', 'カードを1枚引く\nCP+1');
    EffectTemplate.draw(stack.processing.owner, stack.core);

    // CPを+1する
    Effect.modifyCP(stack, stack.processing, owner, 1);
  },
};
