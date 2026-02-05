import catalog from '@/game-data/catalog';
import type { Catalog } from '@/submodule/suit/types';
import { evaluateCardRestriction, evaluateDeckRestriction } from './card-restrictions';
import { getModeConfig } from './mode-restrictions';
import type { MatchingMode, ValidationError, ValidationResult } from './types';

const DECK_SIZE = 40;

/**
 * デッキバリデーター
 * モードに応じたカード制限・デッキ制限を検証する
 */
export class DeckValidator {
  /**
   * デッキを検証する
   */
  validate(mode: MatchingMode, deckIds: string[]): ValidationResult {
    const errors: ValidationError[] = [];
    const config = getModeConfig(mode);

    // 1. デッキ枚数チェック（40枚固定）
    if (deckIds.length !== DECK_SIZE) {
      errors.push({
        type: 'deck_size',
        message: `デッキは${DECK_SIZE}枚である必要があります（現在${deckIds.length}枚）`,
      });
    }

    // 2. カード存在チェックとカタログ情報取得
    const deck: Catalog[] = [];
    const notFoundCards: string[] = [];

    for (const cardId of deckIds) {
      const card = catalog.get(cardId);
      if (!card) {
        notFoundCards.push(cardId);
      } else {
        deck.push(card);
      }
    }

    if (notFoundCards.length > 0) {
      errors.push({
        type: 'card_not_found',
        message: `存在しないカードが含まれています`,
        cardIds: notFoundCards,
      });
    }

    // カードが見つからなければ以降の検証はスキップ
    if (deck.length !== deckIds.length) {
      return { valid: false, errors };
    }

    // 3. カード個別制限チェック
    if (config.cardRestriction) {
      const violatingCards: string[] = [];
      for (const card of deck) {
        if (!evaluateCardRestriction(card, config.cardRestriction)) {
          violatingCards.push(card.id);
        }
      }
      if (violatingCards.length > 0) {
        errors.push({
          type: 'card_restriction',
          message: `モード「${mode}」で使用できないカードが含まれています`,
          cardIds: violatingCards,
        });
      }
    }

    // 4. デッキ全体制限チェック
    if (config.deckRestriction) {
      const result = evaluateDeckRestriction(deck, config.deckRestriction);
      if (!result.valid) {
        errors.push({
          type: 'deck_restriction',
          message: result.detail ?? `デッキ制限に違反しています`,
        });
      }
    }

    // 5. 同名カード枚数チェック（freedom以外は3枚まで）
    if (mode !== 'freedom') {
      const nameCounts = new Map<string, number>();
      for (const card of deck) {
        nameCounts.set(card.name, (nameCounts.get(card.name) ?? 0) + 1);
      }
      for (const [name, count] of nameCounts) {
        if (count > 3) {
          errors.push({
            type: 'deck_restriction',
            message: `カード「${name}」が3枚を超えています（${count}枚）`,
          });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
