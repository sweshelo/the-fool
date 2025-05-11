import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■トリックオアトリート
  // あなたのユニットがフィールドに出た時、トリガーカードを1枚引く。
  checkDrive(stack: StackWithCard) {
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  async onDrive(stack: StackWithCard) {
    const owner = stack.processing.owner;
    await System.show(stack, 'トリックオアトリート', 'トリガーカードを1枚引く');
    if (owner.trigger.length < stack.core.room.rule.player.max.trigger && owner.deck.length > 0) {
      // デッキから1枚選んでトリガーゾーンにセット
      EffectHelper.random(owner.deck, 1).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trigger')
      );
    }
  },

  // あなたのユニットがプレイヤーアタックに成功した時、カードを1枚引く。
  checkPlayerAttack(stack: StackWithCard) {
    return stack.source instanceof Unit && stack.processing.owner.id === stack.source.owner.id;
  },

  async onPlayerAttack(stack: StackWithCard) {
    const owner = stack.processing.owner;
    await System.show(stack, 'トリックオアトリート', 'カードを1枚引く');
    if (owner.hand.length < stack.core.room.rule.player.max.hand && owner.deck.length > 0) {
      EffectHelper.random(owner.deck, 1).forEach(card =>
        Effect.move(stack, stack.processing, card, 'hand')
      );
    }
  },

  // あなたのユニットが戦闘によって対戦相手のユニットを破壊した時、インターセプトカードを1枚引く。
  checkWin(stack: StackWithCard) {
    return stack.source instanceof Unit && stack.source.owner.id === stack.processing.owner.id;
  },

  async onWin(stack: StackWithCard) {
    const owner = stack.processing.owner;
    await System.show(stack, 'トリックオアトリート', 'インターセプトカードを1枚引く');
    if (owner.deck.length > 0) {
      // インターセプトカードの定義はcatalog参照が必要だが、ここではcatalog.type === 'intercept' で判定
      const intercepts = owner.deck.filter(card => card.catalog.type === 'intercept');
      if (intercepts.length > 0 && owner.hand.length < stack.core.room.rule.player.max.hand) {
        EffectHelper.random(intercepts, 1).forEach(card =>
          Effect.move(stack, stack.processing, card, 'hand')
        );
      }
    }
  },
};
