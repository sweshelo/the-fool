import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットが戦闘した時、そのユニットが戦闘中の相手ユニットよりBPが低い場合、
  // ターン終了時まで戦闘中のあなたのユニットのBPを+4000する
  onBattle: async (stack: StackWithCard): Promise<void> => {
    const attacker = stack.source;
    const defender = stack.target;

    if (!(attacker instanceof Unit) || !(defender instanceof Unit)) return;

    // 自分のユニットが戦闘しているか確認
    const isOwnUnitInBattle =
      attacker.owner.id === stack.processing.owner.id ||
      defender.owner.id === stack.processing.owner.id;

    if (!isOwnUnitInBattle) return;

    // 自分のユニットと相手のユニットを特定
    const ownUnit = attacker.owner.id === stack.processing.owner.id ? attacker : defender;
    const opponentUnit = attacker.owner.id === stack.processing.owner.id ? defender : attacker;

    // 自分のユニットのBPが相手より低い場合
    if (ownUnit.currentBP < opponentUnit.currentBP) {
      await System.show(stack, '勇猛なる決起', 'BP+4000');
      Effect.modifyBP(stack, stack.processing, ownUnit, 4000, {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
