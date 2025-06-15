import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // チェック
  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
  },

  // あなたのユニットがフィールドに出た時、【精霊】ユニットのカードを1枚ランダムで手札に加える。
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '世界樹の恵み', '【精霊】を1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      species: '精霊',
    });
  },

  // あなたの【精霊】ユニットがアタックした時、対戦相手のユニットを1体選ぶ。それの行動権を消費する。
  checkAttack: (stack: StackWithCard) => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    return (
      (stack.target instanceof Unit &&
        stack.target.owner.id === stack.processing.owner.id &&
        stack.target.catalog.species?.includes('精霊') &&
        candidates.length > 0) ??
      false
    );
  },

  onAttack: async (stack: StackWithCard) => {
    const opponent = stack.processing.owner.opponent;
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === opponent.id,
      stack.processing.owner
    );

    if (candidates.length === 0) return;

    await System.show(stack, '世界樹の恵み', '行動権を消費');
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      candidates,
      '行動権を消費するユニットを選んでください',
      1
    );
    if (!target) return;

    Effect.activate(stack, stack.processing, target, false);
  },
};
