import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  //■起動・スパルタな愛
  //あなたのトリガーゾーンにあるカードを1枚ランダムで破壊する。そうした場合、対戦相手のトリガーゾーンにあるカードを1枚ランダムで破壊する。（この効果は1ターンに1度発動できる）
  //■冷酷なる躾
  //このユニットがフィールドに出た時、あなたのデッキから1枚ランダムでトリガーゾーンにセットする。

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    //デッキが空、またはトリガーゾーンが満杯なら何もしない
    if (owner.deck.length === 0 || owner.trigger.length >= stack.core.room.rule.player.max.trigger)
      return;

    await System.show(stack, '冷酷なる躾', 'デッキからランダムで1枚トリガーゾーンにセット');

    //デッキからランダムに1枚選択してトリガーゾーンにセット
    EffectHelper.random(owner.deck, 1).forEach(card =>
      Effect.move(stack, stack.processing, card, 'trigger')
    );
  },

  //起動条件確認
  isBootable(core: Core, self: Unit): boolean {
    const owner = self.owner;
    const opponent = owner.opponent;

    //お互いのトリガーゾーンにカードがあるかどうか確認
    return owner.trigger.length > 0 && opponent.trigger.length > 0;
  },

  onBootSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    await System.show(stack, '起動・スパルタな愛', 'お互いのトリガーゾーンからランダムで1枚破壊');

    //自分のトリガーゾーンからランダムで1枚破壊
    EffectHelper.random(owner.trigger, 1).forEach(card =>
      Effect.move(stack, stack.processing, card, 'trash')
    );

    //相手のトリガーゾーンからランダムで1枚破壊
    EffectHelper.random(opponent.trigger, 1).forEach(card =>
      Effect.move(stack, stack.processing, card, 'trash')
    );
  },
};
