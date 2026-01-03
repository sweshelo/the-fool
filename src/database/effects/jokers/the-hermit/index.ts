import { effects as RuinLead } from './ruin-lead';
import { effects as SilenceBillow } from './silence-billow';
import { effects as EvilGambit } from './evil-gambit';

export const JokerName = {
  RuinLead: 'ルインリード',
  SilenceBillow: 'サイレンスビロウ',
  EvilGambit: 'エビルガンビット',
};

export const Hermit = {
  [JokerName.RuinLead]: RuinLead,
  [JokerName.SilenceBillow]: SilenceBillow,
  [JokerName.EvilGambit]: EvilGambit,
};
