import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■ライブオンステージ
  // あなたのターン開始時、対戦相手のフィールドにいるユニット数が3体以上で、
  // あなたのフィールドにいるユニット数が2体以下の場合、あなたはカードを1枚引く。あなたのCPを+2する。

  // インターセプトカード用チェック関数
  checkTurnStart(stack: StackWithCard): boolean {
    const owner = stack.processing.owner;
    const turnPlayer = stack.core.getTurnPlayer();

    // 自分のターン開始時のみ発動
    if (owner.id !== turnPlayer.id) return false;

    // 対戦相手のフィールドにいるユニット数が3体以上
    const opponentUnits = owner.opponent.field.length;

    // 自分のフィールドにいるユニット数が2体以下
    const ownUnits = owner.field.length;

    return opponentUnits >= 3 && ownUnits <= 2;
  },

  // ライブオンステージの効果
  async onTurnStart(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;

    await System.show(stack, 'ライブオンステージ', 'カードを1枚引く\nCP+2');
    EffectTemplate.draw(stack.processing.owner, stack.core);
    // CPを+2する
    Effect.modifyCP(stack, stack.processing, owner, 2);
  },
};
