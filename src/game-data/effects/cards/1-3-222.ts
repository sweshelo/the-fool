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
    // デッキの上から3枚を取得（存在する場合）
    const deckTop3 = stack.processing.owner.deck.slice(0, 3);

    // ブラック青龍がいる場合、デッキから3枚見て1枚選んで手札に加えて残りは捨てる
    if (hasBlackSeiryu && deckTop3.length === 3) {
      await System.show(
        stack,
        '四聖の共鳴',
        'コスト4のユニットを引く\nデッキから3枚見て1枚選び残りは捨てる'
      );

      if (deckTop3.length > 0) {
        // プレイヤーに選択を促す
        const [choice] = await System.prompt(stack, stack.processing.owner.id, {
          title: '手札に加えるカードを選択してください',
          type: 'card',
          items: deckTop3,
          count: 1,
        });

        // 選んだカードを手札に加え、残りを捨札に送る
        for (const card of deckTop3) {
          if (card.id === choice) {
            Effect.move(stack, stack.processing, card, 'hand');
          } else {
            Effect.move(stack, stack.processing, card, 'trash');
          }
        }
      }
    } else {
      await System.show(stack, '四聖の共鳴', 'コスト4のユニットを引く');
    }

    // コスト4のユニットカードをランダムで1枚手札に加える
    const [card] = EffectHelper.random(
      stack.processing.owner.deck.filter(card => card.catalog.cost === 4 && card instanceof Unit),
      1
    );
    if (card) Effect.move(stack, stack.processing, card, 'hand');
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
