import { effects as FakeMake } from './fake-make';
import { effects as TwinkleLink } from './twinkle-link';
import { effects as AnotherVisor } from './another-visor';

export const JokerName = {
  FakeMake: 'フェイク×メイク',
  TwinkleLink: 'ティンクル×リンク',
  AnotherVisor: 'アナザー×バイザー',
};

export const Lovers = {
  [JokerName.FakeMake]: FakeMake,
  [JokerName.TwinkleLink]: TwinkleLink,
  [JokerName.AnotherVisor]: AnotherVisor,
};
