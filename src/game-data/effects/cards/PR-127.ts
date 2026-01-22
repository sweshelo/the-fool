import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    const targets = [
      ...stack.processing.owner.field.filter(unit => unit.id !== stack.processing.id),
      ...opponent.field.filter(unit => unit.id !== stack.processing.id),
    ];
    if (targets.length === 0) return;

    // 自身以外の全てのユニットに【沈黙】を与える
    await System.show(stack, '消散の一声', '全てのユニットに【沈黙】を与える');

    targets.forEach(unit => {
      Effect.keyword(stack, stack.processing, unit, '沈黙');
    });
  },

  // アタック時の効果
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 手札が0枚の場合は何もしない
    if (owner.hand.length === 0) return;

    await System.show(stack, '滅王の暴虐', '手札を1枚捨てる');

    // 手札を1枚選んで捨てる
    const [targetId] = await System.prompt(stack, owner.id, {
      type: 'card',
      title: '捨てるカードを選択',
      items: owner.hand,
      count: 1,
    });

    const target = owner.hand.find(card => card.id === targetId);
    if (!target) return;

    Effect.break(stack, stack.processing, target);
  },
};
