import { effects as LittleWand } from './little-wand';
import { effects as WonderfulHand } from './wonderful-hand';
import { effects as TrickFinger } from './trick-finger';

export const JokerName = {
  LittleWand: 'リトルウォンド',
  WonderfulHand: 'ワンダフルハンド',
  TrickFinger: 'トリックフィンガー',
};

export const Magician = {
  [JokerName.LittleWand]: LittleWand,
  [JokerName.WonderfulHand]: WonderfulHand,
  [JokerName.TrickFinger]: TrickFinger,
};
