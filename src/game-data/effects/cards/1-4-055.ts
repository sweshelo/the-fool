import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■殺意放出
  // あなたのユニットがフィールドに出た時、対戦相手のコスト4以上の全てのユニットにターン終了時まで【防御禁止】を与える。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分のユニットが出た時のみ発動
    if (stack.source.id !== owner.id) return false;

    // 対戦相手のコスト4以上のユニットがいるか確認
    const hasTargets = opponent.field.some(unit => unit.catalog.cost >= 4);
    return hasTargets;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    await System.show(stack, '殺意放出', 'コスト4以上に【防御禁止】');

    // 対戦相手のコスト4以上の全てのユニットに【防御禁止】を与える
    opponent.field
      .filter(unit => unit.catalog.cost >= 4)
      .forEach(unit => {
        Effect.keyword(stack, stack.processing, unit, '防御禁止', {
          event: 'turnEnd',
          count: 1,
        });
      });
  },
};
