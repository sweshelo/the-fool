import { effects as ruinLead } from './ruin-lead';
import { effects as graphityEarth } from './graphity-earth';

export const jokerEffects: Record<string, any> = {
  ルインリード: ruinLead,
  グラフィティ・アース: graphityEarth,

  // TODO: Add other joker abilities as they are implemented
  // 'サイレンスビロウ': undefined,
  // 'エビルガンビット': undefined,
};
