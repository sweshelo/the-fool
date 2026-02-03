import type { MatchingMode, ModeConfig } from './types';

/**
 * 各マッチングモードの設定
 */
export const modeConfigs: Record<MatchingMode, ModeConfig> = {
  freedom: {
    cardRestriction: null,
    deckRestriction: null,
    ruleOverrides: {},
    description: '制限なし。全カード使用可能。',
  },

  standard: {
    cardRestriction: { type: 'version', operator: '>=', value: 6 },
    deckRestriction: null,
    ruleOverrides: {},
    description: 'Ver.1.2以降。同名カード3枚まで。',
  },

  legacy: {
    cardRestriction: { type: 'version', operator: '<=', value: 14 },
    deckRestriction: null,
    ruleOverrides: {
      joker: {
        suicide: true,
        single: true,
        inHand: true,
        gauge: 0,
        lifeDamage: 15,
        maxTurnEnd: 15,
        minTurnEnd: 2.5,
      },
      player: {
        max: {
          life: 7,
          hand: 7,
          trigger: 4,
          field: 5,
        },
      },
    },
    description: 'Ver.1.4EX1以前。1stジョーカー、手札加算方式。',
  },

  limited: {
    cardRestriction: null,
    deckRestriction: { type: 'totalOriginality', min: 100 },
    ruleOverrides: {},
    description: 'デッキ合計オリジナリティ100以上必須。',
  },
};

/**
 * モード設定を取得する
 */
export function getModeConfig(mode: MatchingMode): ModeConfig {
  return modeConfigs[mode];
}
