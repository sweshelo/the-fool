import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import { Effect } from '../../classes/effect';
import type { CardEffects, StackWithCard } from '../../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    // デッキにコスト7以下のユニットが存在するか確認
    return player.deck.some(card => card.catalog.type === 'unit' && card.catalog.cost <= 7);
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    // デッキからコスト7以下のユニットをフィルタリング
    const candidates = owner.deck.filter(
      card => card.catalog.type === 'unit' && card.catalog.cost <= 7
    );

    if (candidates.length === 0) return;

    await System.show(stack, '蘭翔鳳集の舞', 'デッキから【特殊召喚】\n基本BP+3000');

    // デッキからコスト7以下のユニットを1体選ぶ
    const [selectedCard] = await EffectHelper.selectCard(
      stack,
      owner,
      candidates,
      '【特殊召喚】するユニットを選択'
    );

    // 【特殊召喚】する
    if (selectedCard instanceof Unit) {
      const unit = await Effect.summon(stack, stack.processing, selectedCard);
      // そのユニットの基本BPを+3000する
      if (unit) Effect.modifyBP(stack, stack.processing, unit, 3000, { isBaseBP: true });
    }
  },
};
