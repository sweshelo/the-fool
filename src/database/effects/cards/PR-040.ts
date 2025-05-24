import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■盗賊のアジト
  // あなたのユニットがフィールドに出た時、【盗賊】ユニットのカードを1枚ランダムで手札に加える。
  // NOTE: トリガーカードのチェッカーを実装
  checkDrive(stack: StackWithCard): boolean {
    // 自分のユニットが召喚された時に発動
    return stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
  },

  async onDrive(stack: StackWithCard) {
    await System.show(stack, '盗賊のアジト', '【盗賊】のカードを手札に加える');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '盗賊' });
  },

  // あなたの【盗賊】ユニットがプレイヤーアタックに成功した時、対戦相手は手札を1枚ランダムで捨て、あなたはカードを1枚引く。
  checkPlayerAttack(stack: StackWithCard): boolean {
    // プレイヤーアタックに成功したユニットが自分の【盗賊】ユニットか確認
    return (
      stack.source instanceof Unit &&
      stack.source.owner.id === stack.processing.owner.id &&
      stack.source.catalog.species?.includes('盗賊') === true
    );
  },

  async onPlayerAttack(stack: StackWithCard) {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, '盗賊のアジト', '手札を1枚捨てる\nカードを1枚引く');

    // 相手の手札が存在する場合、1枚ランダムで捨てる
    if (opponent.hand.length > 0) {
      const randomCard = EffectHelper.random(opponent.hand, 1)[0];
      if (randomCard) {
        Effect.handes(stack, stack.processing, randomCard);
      }
    }

    // 自分はカードを1枚引く
    if (owner.deck.length > 0 && owner.hand.length < stack.core.room.rule.player.max.hand) {
      const cardToDraw = owner.deck[0];
      if (cardToDraw) {
        Effect.move(stack, stack.processing, cardToDraw, 'hand');
      }
    }
  },
};
