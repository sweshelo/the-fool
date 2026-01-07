import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    return EffectHelper.isUnitSelectable(core, (unit: Unit) => unit.owner.id !== player.id, player);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const filter = (unit: Unit) => unit.owner.id !== owner.id;

    await System.show(stack, 'チェックメイトアクト', '【防御禁止】付与\nトリガーセット');

    // 対戦相手のユニットを2体まで選ぶ
    const targets = await EffectHelper.pickUnit(
      stack,
      owner,
      filter,
      '【防御禁止】を与えるユニットを選択',
      2
    );

    // 【防御禁止】を与える
    targets.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '防御禁止');
    });

    // デッキからインターセプトカードを2枚までランダムでトリガーゾーンにセットする
    const interceptCards = owner.deck.filter(card => card.catalog.type === 'intercept');
    const setCount = Math.min(2, interceptCards.length);
    const cardsToSet = EffectHelper.random(interceptCards, setCount);

    cardsToSet.forEach(card => {
      Effect.move(stack, stack.processing, card, 'trigger');
    });
  },
};
