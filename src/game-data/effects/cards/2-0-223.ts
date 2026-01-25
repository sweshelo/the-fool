import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■ターゲットインサイト
  // あなたのユニットがフィールドに出た時、あなたは手札から進化ユニット以外のユニットカードを1枚選んで捨てる。そうした場合、捨てたユニットと同じコストの全てのユニットを破壊する。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のユニットが出た時のみ発動
    if (stack.source.id !== owner.id) return false;

    // 手札に進化ユニット以外のユニットカードがあるか確認
    const hasUnitCard = owner.hand.some(card => card instanceof Unit && !(card instanceof Evolve));
    return hasUnitCard;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 手札の進化ユニット以外のユニットカードをフィルタリング
    const unitCards = owner.hand.filter(card => card instanceof Unit && !(card instanceof Evolve));

    if (unitCards.length === 0) return;

    await System.show(stack, 'ターゲットインサイト', '手札を捨てる\n同コストを全て破壊');

    // 手札から進化ユニット以外のユニットカードを1枚選んで捨てる
    const [selectedCard] = await EffectHelper.selectCard(
      stack,
      owner,
      unitCards,
      '捨てるユニットカードを選択'
    );

    const discardedCost = selectedCard.catalog.cost;

    // カードを捨てる
    Effect.break(stack, stack.processing, selectedCard);

    // 捨てたユニットと同じコストの全てのユニットを破壊
    stack.core.players.forEach(player => {
      player.field
        .filter(unit => unit.catalog.cost === discardedCost)
        .forEach(unit => {
          Effect.break(stack, stack.processing, unit);
        });
    });
  },
};
