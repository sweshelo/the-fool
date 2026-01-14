import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■抄掠のオードブル
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.field.length <= 4) {
      // デッキからランダムで5枚取得
      const randomCards = EffectHelper.random(stack.processing.owner.deck, 5);

      // 3コスト以下の【獣】か【不死】ユニットを抽出
      const validUnits = randomCards.filter(
        card =>
          card instanceof Unit &&
          card.catalog.cost <= 3 &&
          (card.catalog.species?.includes('獣') || card.catalog.species?.includes('不死'))
      );

      if (validUnits.length > 0) {
        await System.show(stack, '抄掠のオードブル', '【獣】か【不死】を【特殊召喚】');

        // プレイヤーに選択させる
        const [selected] = await EffectHelper.selectCard(
          stack,
          stack.processing.owner,
          validUnits,
          '特殊召喚するユニットを選択',
          1
        );

        if (selected instanceof Unit) {
          await Effect.summon(stack, stack.processing, selected);
        }

        // 残りのカードを捨札に送る
        randomCards.forEach(card => {
          if (card.id !== selected.id) {
            Effect.move(stack, stack.processing, card, 'trash');
          }
        });
      } else {
        await System.show(stack, '抄掠のオードブル', '捨札に5枚送る');

        // 対象がない場合は全て捨札に送る
        randomCards.forEach(card => {
          Effect.move(stack, stack.processing, card, 'trash');
        });
      }
    }
  },
};
