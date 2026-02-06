export { MatchingManager } from './matching-manager';
export { DeckValidator } from './deck-validator';
export { getModeConfig, modeConfigs } from './mode-restrictions';
export {
  evaluateCardRestriction,
  evaluateDeckRestriction,
  calculateTotalOriginality,
} from './card-restrictions';
export type {
  MatchingMode,
  QueuedPlayer,
  MatchResult,
  JoinResult,
  JoinError,
  ValidationError,
  ValidationResult,
  RuleOverrides,
  CardRestriction,
  DeckRestriction,
  ModeConfig,
} from './types';
