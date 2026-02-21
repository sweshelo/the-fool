import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkAttack: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    const isOwnerAttack = owner.id === stack.source.id;
    const isOpponentAttack = opponent.id === stack.source.id;
    const hasCost4Over = opponent.field.some(unit => unit.catalog.cost >= 4);
    const hasCost3Over = opponent.field.some(unit => unit.catalog.cost >= 3);

    // あなたのユニットがアタックした時、対戦相手のコスト4以上のユニットが存在する
    // 対戦相手のユニットがアタックした時、対戦相手のコスト3以上のユニットが存在する
    return (isOwnerAttack && hasCost4Over) || (isOpponentAttack && hasCost3Over);
  },

  onAttack: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    const isOwnerAttack = owner.id === stack.source.id;
    const isOpponentAttack = opponent.id === stack.source.id;

    // あなたのユニットがアタックした時
    if (isOwnerAttack) {
      await System.show(stack, 'ホーリーサイクロン', 'コスト4以上のユニットの行動権を消費');
      const cost4OverUnits = opponent.field.filter(unit => unit.catalog.cost >= 4);
      cost4OverUnits.forEach(unit => Effect.activate(stack, stack.processing, unit, false));
    }
    // 対戦相手のユニットがアタックした時
    if (isOpponentAttack) {
      await System.show(stack, 'ホーリーサイクロン', 'コスト3以上のユニットの行動権を消費');
      const cost3OverUnits = opponent.field.filter(unit => unit.catalog.cost >= 3);
      cost3OverUnits.forEach(unit => Effect.activate(stack, stack.processing, unit, false));
    }
  },
};
