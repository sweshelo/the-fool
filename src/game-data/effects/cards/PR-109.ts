import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targets = [
      ...stack.processing.owner.field,
      ...stack.processing.owner.opponent.field,
    ].filter(unit => unit.id !== stack.processing.id);
    if (targets.length > 0) {
      await System.show(
        stack,
        '天意の執行',
        '【加護】\n【沈黙効果耐性】\n自身以外の行動権を消費\n【呪縛】を与える'
      );
      targets.forEach(unit => {
        Effect.keyword(stack, stack.processing, unit, '呪縛');
        Effect.activate(stack, stack.processing, unit, false);
      });
    } else {
      await System.show(
        stack,
        '加護＆沈黙効果耐性',
        '効果に選ばれない\n対戦相手の効果によって【沈黙】を付与されない'
      );
    }

    Effect.keyword(stack, stack.processing, stack.processing, '加護');
    Effect.keyword(stack, stack.processing, stack.processing, '沈黙効果耐性');
  },

  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targets = stack.processing.owner.opponent.field.filter(unit => !unit.active);
    if (targets.length > 0) {
      await System.show(stack, '天意の執行', '行動済みの敵全体を消滅');
      targets.forEach(unit => Effect.delete(stack, stack.processing, unit));
    }
  },

  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      stack.processing.owner.hand.length <= 6 &&
      stack.processing.owner.deck.length >= 5
    ) {
      await System.show(stack, '天意の選定', 'デッキから5枚見る\n1枚選び手札に加える\n残りは消滅');
      const targets = EffectHelper.random(stack.processing.owner.deck, 5);
      const [draw] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        targets,
        '手札に加えるカードを選択して下さい',
        1
      );

      Effect.move(stack, stack.processing, draw, 'hand');
      targets.forEach(card => {
        if (card.id !== draw.id) Effect.move(stack, stack.processing, card, 'delete');
      });
    }
  },
};
