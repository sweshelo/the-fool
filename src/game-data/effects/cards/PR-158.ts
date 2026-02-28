import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットがアタックした時
  checkAttack: (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (opponent.field.length === 0) return false;

    //自プレイヤーが攻撃宣言した時のみ発動可能
    return stack.source.id === owner.id;
  },

  onAttack: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    await System.show(
      stack,
      'エレクトリックファング',
      '敵全体の行動権を消費\n[対戦相手のユニット数×1]ライフダメージ'
    );

    opponent.field.forEach(unit => Effect.activate(stack, stack.processing, unit, false));
    // ライフダメージを受ける
    const damage = opponent.field.length * -1;
    Effect.modifyLife(stack, stack.processing, owner, damage);
  },
};
