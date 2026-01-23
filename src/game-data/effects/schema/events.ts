export const cardEvents = [
  'drive',
  'clockup',
  'clockdown',
  'overclock',
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
  'extraSummon',
  'boot',
  'joker',
] as const;

export const commonEvents = [
  'modifyCP',
  'modifyPurple',
  'turnStart',
  'turnEnd',
  'intercept',
  'trigger',
] as const;

export const internalEvents = [
  '_postBattle',
  '_postBattleClockUp',
  '_withdraw',
  '_messageReceived',
  '_deathCounterCheckStack',
  '_preDrive',
] as const;

// Union型として抽出
export type CardEvent = (typeof cardEvents)[number];
export type CommonEvent = (typeof commonEvents)[number];
export type InternalEvent = (typeof internalEvents)[number];
export type GameEvent = CardEvent | CommonEvent | InternalEvent;

// 型ガード
export function isGameEvent(value: string): value is GameEvent {
  return (
    (cardEvents as readonly string[]).includes(value) ||
    (commonEvents as readonly string[]).includes(value) ||
    (internalEvents as readonly string[]).includes(value)
  );
}
