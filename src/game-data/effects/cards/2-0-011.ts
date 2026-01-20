import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '神託', '奇跡を発動すると【神託】は取り除かれる');
    Effect.keyword(stack, stack.processing, stack.processing, '神託');
  },

  onTurnStart: async (stack: StackWithCard<Unit>) => {
    // 自分のターン開始時のみ発動
    if (stack.processing.owner.id !== stack.core.getTurnPlayer().id) {
      return;
    }

    // 【神託】を持っているか確認
    if (!stack.processing.hasKeyword('神託')) {
      return;
    }

    // デッキからカードを1枚選ぶ
    const deck = stack.processing.owner.deck;
    if (deck.length === 0) {
      return;
    }

    await System.show(stack, '奇跡・出会いは必然', 'デッキから1枚引く');
    const [selectedCard] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      deck,
      '手札に加えるカードを選択'
    );
    if (!selectedCard) {
      return;
    }

    // カードを手札に加える
    Effect.move(stack, stack.processing, selectedCard, 'hand');
    // 【神託】を取り除く
    Effect.removeKeyword(stack, stack.processing, '神託');
  },

  onBattleSelf: async (stack: StackWithCard<Unit>) => {
    const opponent = stack.processing.owner.opponent;
    const triggerZone = opponent.trigger;
    if (triggerZone.length === 0) {
      return;
    }

    await System.show(stack, 'トリガーリターン', 'トリガーゾーンから1枚手札に戻す');
    const [selectedCard] = EffectHelper.random(triggerZone);
    if (!selectedCard) {
      return;
    }

    Effect.move(stack, stack.processing, selectedCard, 'hand');
  },
};
