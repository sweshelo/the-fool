import type { Catalog, PlayerDeck } from '@/submodule/suit/types';
import type { CardRestriction, DeckRestriction } from './types';
import master from '@/game-data/catalog';

/**
 * カード単体の制限条件を評価する
 */
export function evaluateCardRestriction(card: Catalog, restriction: CardRestriction): boolean {
  switch (restriction.type) {
    case 'version': {
      const version = card.info.version;
      switch (restriction.operator) {
        case '<=':
          return version <= restriction.value;
        case '>=':
          return version >= restriction.value;
        case '==':
          return version === restriction.value;
        case '<':
          return version < restriction.value;
        case '>':
          return version > restriction.value;
      }
      break;
    }
    case 'and':
      return restriction.conditions.every(cond => evaluateCardRestriction(card, cond));
    case 'or':
      return restriction.conditions.some(cond => evaluateCardRestriction(card, cond));
    case 'not':
      return !evaluateCardRestriction(card, restriction.condition);
  }
}

/**
 * デッキ全体の制限条件を評価する
 */
export function evaluateDeckRestriction(
  deck: PlayerDeck,
  restriction: DeckRestriction
): { valid: boolean; detail?: string } {
  switch (restriction.type) {
    case 'sameNameLimit': {
      const nameCounts = new Map<string, number>();
      for (const cardId of deck.cards) {
        const card = master.get(cardId);
        if (!card)
          return {
            valid: false,
            detail: '不明なカードが含まれています',
          };
        const count = (nameCounts.get(card.name) ?? 0) + 1;
        nameCounts.set(card.name, count);
        if (count > restriction.max) {
          return {
            valid: false,
            detail: `カード「${card.name}」が${restriction.max}枚を超えています（${count}枚）`,
          };
        }
      }
      return { valid: true };
    }
    case 'totalOriginality': {
      const totalOp = calculateTotalOriginality(deck);
      if (totalOp < restriction.min) {
        return {
          valid: false,
          detail: `デッキのオリジナリティ合計が${restriction.min}未満です（${totalOp}）`,
        };
      }
      return { valid: true };
    }
  }
}

/**
 * デッキのオリジナリティ合計を計算する
 * originality が数値でない場合（"--"など）は 0 として計算
 */
export function calculateTotalOriginality(deck: PlayerDeck): number {
  return [...deck.cards, ...deck.jokers].reduce((sum, cardId) => {
    const card = master.get(cardId);
    const op = card?.originality;
    return sum + (typeof op === 'number' ? op : 0);
  }, 0);
}
