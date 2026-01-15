import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 対戦相手のトリガーゾーンにカードがない場合、以下の効果が発動する。
  // このユニットがフィールドに出た時、対戦相手の全てのユニットに2000ダメージを与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のトリガーゾーンにカードがない場合のみ発動
    if (opponent.trigger.length > 0) {
      return;
    }

    const targets = opponent.field;

    if (targets.length === 0) {
      return;
    }

    await System.show(stack, 'ガトリングスマッシャー', '敵全体に2000ダメージ');
    targets.forEach(unit => Effect.damage(stack, stack.processing, unit, 2000));
  },

  // 対戦相手のトリガーゾーンにカードがない場合、以下の効果が発動する。
  // このユニットがアタックした時、対戦相手の全てのユニットに3000ダメージを与える。
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のトリガーゾーンにカードがない場合のみ発動
    if (opponent.trigger.length > 0) {
      return;
    }

    const targets = opponent.field;

    if (targets.length === 0) {
      return;
    }

    await System.show(stack, 'ガトリングスマッシャー', '敵全体に3000ダメージ');
    targets.forEach(unit => Effect.damage(stack, stack.processing, unit, 3000));
  },
};
