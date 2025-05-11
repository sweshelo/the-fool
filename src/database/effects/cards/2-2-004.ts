import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // 【消滅効果耐性】（召喚時付与）＋フィールドに出た時: 機械3体以上でスピードムーブ
  async onDriveSelf(stack: StackWithCard<Unit>) {
    const self = stack.processing;
    const owner = self.owner;
    // 機械ユニット3体以上
    const machines = owner.field.filter(
      unit => Array.isArray(unit.catalog.species) && unit.catalog.species.includes('機械')
    );
    if (machines.length >= 3) {
      await System.show(stack, '炎式機工甲冑', '【スピードムーブ】\n【消滅効果耐性】を得る');
      Effect.speedMove(stack, self);
    } else {
      await System.show(stack, '炎式機工甲冑', '【消滅効果耐性】を得る');
    }
    // キーワード付与
    Effect.keyword(stack, self, self, '消滅効果耐性');
  },

  // アタック時: 機械3体以上でデッキから1枚トリガーゾーンにセット
  async onAttackSelf(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;
    const machines = owner.field.filter(
      unit => Array.isArray(unit.catalog.species) && unit.catalog.species.includes('機械')
    );
    if (
      machines.length >= 3 &&
      owner.deck.length > 0 &&
      owner.trigger.length < stack.core.room.rule.player.max.trigger
    ) {
      await System.show(stack, '炎式機工甲冑二式', 'デッキから1枚トリガーゾーンにセット');
      const [card] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        stack.processing.owner.deck,
        'トリガーゾーンにセットするカードを選んで下さい',
        1
      );
      if (card) {
        Effect.move(stack, stack.processing, card, 'trigger');
      }
    }
  },
};
