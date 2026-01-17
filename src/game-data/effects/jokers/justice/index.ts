import { effects as BraveShield } from './brave-shield';
import { effects as DivineShield } from './divine-shield';
import { effects as SacredShield } from './sacred-shield';

export const JokerName = {
  BraveShield: 'ブレイブシールド',
  DivineShield: 'ディバインシールド',
  SacredShield: 'セイクリッドシールド',
};

export const Justice = {
  [JokerName.BraveShield]: BraveShield,
  [JokerName.DivineShield]: DivineShield,
  [JokerName.SacredShield]: SacredShield,
};
