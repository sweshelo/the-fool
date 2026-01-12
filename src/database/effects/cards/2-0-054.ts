import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 対戦相手のユニットがアタックした時、それに【呪縛】を与える。
  // あなたのユニットがアタックした時、対戦相手の全てのユニットに［対戦相手の行動済ユニットの数×1000］ダメージを与える。
  checkAttack: (stack: StackWithCard): boolean => {
    // 攻撃イベントの対象（attacker）がユニットである場合
    if (!(stack.target instanceof Unit)) return false;

    const attacker = stack.target as Unit;
    const owner = stack.processing.owner;

    // 相手が攻撃した場合は常に発動可能
    if (attacker.owner.id !== owner.id) return true;

    // 自分が攻撃した場合は、対戦相手に行動済ユニットが存在する時のみ発動可能
    const opponent = owner.opponent;
    return opponent.field.some(u => !u.active);
  },

  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const attacker = stack.target;
    if (!(attacker instanceof Unit)) return;

    // 対戦相手のユニットがアタックした時：それに呪縛を与える
    if (attacker.owner.id !== owner.id) {
      await System.show(stack, '美しき彫像', '【呪縛】を与える');
      Effect.keyword(stack, stack.processing, attacker, '呪縛');
      return;
    }

    // あなたのユニットがアタックした時：敵全体に（敵の行動済ユニット数×1000）ダメージ
    if (attacker.owner.id === owner.id) {
      const opponent = owner.opponent;
      const actedCount = opponent.field.filter(u => !u.active).length;

      const damage = actedCount * 1000;
      if (damage <= 0) return;

      await System.show(stack, '美しき彫像', `敵全体に[行動済ユニット数×1000]ダメージ`);
      for (const unit of opponent.field) {
        Effect.damage(stack, stack.processing, unit, damage, 'effect');
      }
    }
  },
};
