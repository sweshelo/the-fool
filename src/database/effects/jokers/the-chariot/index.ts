import { effects as TerminateCommand } from './terminate-command';
import { effects as MassiveSurge } from './massive-surge';
import { effects as AimingCrash } from './aiming-crash';

export const JokerName = {
  TerminateCommand: 'ターミネートコマンド',
  MassiveSurge: 'マッシヴサージ',
  AimingCrash: 'エイミングクラッシュ',
};

export const Chariot = {
  [JokerName.TerminateCommand]: TerminateCommand,
  [JokerName.MassiveSurge]: MassiveSurge,
  [JokerName.AimingCrash]: AimingCrash,
};
