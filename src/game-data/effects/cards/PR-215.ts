import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■神への反逆
  // あなたのターン開始時、対戦相手のトリガーゾーンのカードをランダムで1枚破壊する。
  // NOTE: インターセプトカードのチェッカーを実装
  checkTurnStart(stack: StackWithCard): boolean {
    const owner = stack.processing.owner;
    const turnPlayer = stack.core.getTurnPlayer();

    // 自分のターン開始時かつ相手のトリガーゾーンにカードがある場合に発動
    return owner.id === turnPlayer.id && owner.opponent.trigger.length > 0;
  },

  async onTurnStart(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 相手のトリガーゾーンにカードがあるか確認
    if (opponent.trigger.length > 0) {
      await System.show(stack, '神への反逆', 'トリガーカードを破壊');

      // ランダムで1枚選んで破壊
      const targetCard = EffectHelper.random(opponent.trigger, 1)[0];
      if (targetCard) {
        Effect.move(stack, stack.processing, targetCard, 'trash');
      }
    }
  },

  // 対戦相手の【神】ユニットがフィールドに出た時、それを破壊する。
  checkDrive(stack: StackWithCard): boolean {
    // 相手の【神】ユニットが召喚された時に発動
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.opponent.id &&
      stack.target.catalog.species?.includes('神') === true
    );
  },

  async onDrive(stack: StackWithCard) {
    if (stack.target instanceof Unit) {
      await System.show(stack, '神への反逆', '【神】ユニットを破壊');
      Effect.break(stack, stack.processing, stack.target);
    }
  },
};
