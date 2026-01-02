import { effects as RuinLead } from './ruin-lead';

export const JokerName = {
  RuinLead: 'ルインリード',
  SilenceBillow: 'サイレンスビロウ',
  EvilGambit: 'エビルガンビット',
};

export const Hermit = {
  [JokerName.RuinLead]: RuinLead,
  [JokerName.SilenceBillow]: undefined,
  [JokerName.EvilGambit]: undefined,
};
