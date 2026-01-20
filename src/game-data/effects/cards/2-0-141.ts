import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットがアタックした時、対戦相手の全ての行動済ユニットに5000ダメージを与える。
  checkAttack: (stack: StackWithCard): boolean => {
    // 攻撃対象がユニットであること
    if (!(stack.target instanceof Unit)) return false;

    const attacker = stack.target;
    const owner = stack.processing.owner;

    // 自分が攻撃した時のみ発動可能
    if (attacker.owner.id !== owner.id) return false;

    // 相手の行動済ユニットが存在する場合にのみ発動
    return owner.opponent.field.some(unit => !unit.active);
  },

  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    const targets = opponent.field.filter(unit => !unit.active);

    await System.show(stack, 'サンドストーム', '行動済ユニットに5000ダメージ');
    targets.forEach(unit => Effect.damage(stack, stack.processing, unit, 5000, 'effect'));
  },
};
