import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

// カードがフィールドにあるかをカタログの name で判断するヘルパー関数
const hasFourGodCard = (stack: StackWithCard<Unit>, name: string): boolean => {
  return stack.processing.owner.field.some(unit => unit.catalog.name === name);
};

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、コスト4のユニットカードを1枚ランダムで手札に加える。
  // あなたのフィールドに［ブラック青龍］がいる場合、デッキから3枚見て1枚選んで手札に加えて残りは捨てる。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // ブラック青龍がいるかどうかをチェック
    const hasBlackSeiryu = hasFourGodCard(stack, 'ブラック青龍');

    // デッキ内のコスト4であるユニット
    const cost4Units = stack.processing.owner.deck.filter(
      card => card.catalog.cost === 4 && card instanceof Unit
    );

    // デッキの残り枚数を計算する
    // 現在デッキ枚数 - （デッキにコスト4のユニットがあれば 1、無ければ 0）
    const countDeck = stack.processing.owner.deck.length - (cost4Units.length > 0 ? 1 : 0);

    // 手札の空き枚数を計算する
    // ルールでの手札上限値 - 現在手札枚数 - （デッキにコスト4のユニットがあれば 1、無ければ 0）
    const countHandBlank =
      stack.core.room.rule.player.max.hand -
      stack.processing.owner.hand.length -
      (cost4Units.length > 0 ? 1 : 0);

    await EffectHelper.combine(stack, [
      // コスト4のユニットカードをランダムで1枚手札に加える
      {
        title: '四聖の共鳴',
        description: 'コスト4のユニットを引く',
        effect: () => {
          const [card] = EffectHelper.random(cost4Units, 1);
          if (card) Effect.move(stack, stack.processing, card, 'hand');
        },
      },
      // ブラック青龍がいる場合、デッキから3枚見て1枚選んで手札に加えて残りは捨てる
      {
        title: '四聖の共鳴',
        description: 'デッキから3枚見て1枚選び残りは捨てる',
        effect: async () => {
          // デッキの上から3枚を取得
          const deckTop3 = stack.processing.owner.deck.slice(0, 3);

          const [selected] = await EffectHelper.selectCard(
            stack,
            stack.processing.owner,
            deckTop3,
            '手札に加えるカードを選択してください'
          );

          // 選んだカードを手札に加え、残りを捨札に送る
          for (const card of deckTop3) {
            if (card.id === selected.id) {
              Effect.move(stack, stack.processing, card, 'hand');
            } else {
              Effect.move(stack, stack.processing, card, 'trash');
            }
          }
        },
        condition: hasBlackSeiryu && countDeck >= 3 && countHandBlank > 0,
      },
    ]);
  },

  // このユニットが破壊された時、コスト4のユニットカードを1枚ランダムで手札に加える。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '蒼麗槍雅', 'コスト4のユニットを引く');

    // コスト4のユニットカードをランダムで1枚手札に加える
    const [card] = EffectHelper.random(
      stack.processing.owner.deck.filter(card => card.catalog.cost === 4 && card instanceof Unit),
      1
    );
    if (card) Effect.move(stack, stack.processing, card, 'hand');
  },
};
