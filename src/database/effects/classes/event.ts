export const events = [
  'drive',
  'clockup',
  'clockdown',
  'overclock',
  'turnStart',
  'turnEnd',
  'attack',
  'block',
  'battle',
  'playerAttack',
  'win',
  'damage',
  'break',
  'delete',
  'bounce',
  'handes',
  'lost',
  'move',
  'modifyCP',
  'modifyPurple',
  'extraSummon',
  'intercept',
  'trigger',
  'boot',
] as const;

export const internalEvents = [
  '_postBattle',
  '_postBattleClockUp',
  '_withdraw',
  '_messageRecieved',
  '_deathCounterCheckStack',
] as const;

// Union型として抽出
export type Event = (typeof events)[number];
export type InternalEvent = (typeof internalEvents)[number];
export type AllEvents = Event | InternalEvent;
