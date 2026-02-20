// ■タイタンの撃砕
// あなたのユニットがアタックした時、対戦相手のコスト3以下のユニットを1体選ぶ。それの行動権を消費する。
// あなたのターン開始時、対戦相手のユニットを1体選ぶ。それに【呪縛】を与える。
import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットがアタックした時
  checkAttack: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のコスト3以下のユニットが存在する
    const filter = (unit: Unit) => unit.owner.id === opponent.id && unit.catalog.cost <= 3;

    return owner.id === stack.source.id && EffectHelper.isUnitSelectable(stack.core, filter, owner);
  },

  onAttack: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    const filter = (unit: Unit) => unit.owner.id === opponent.id && unit.catalog.cost <= 3;

    await System.show(stack, 'タイタンの撃砕', 'コスト3以下のユニットの行動権を消費');
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      filter,
      '行動権を消費するユニットを選択'
    );
    Effect.activate(stack, stack.processing, target, false);
  },

  // あなたのターン開始時
  checkTurnStart: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    return (
      owner.id === stack.source.id && EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)
    );
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, 'タイタンの撃砕', '【呪縛】を付与');
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '【呪縛】を付与するユニットを選択'
    );
    Effect.keyword(stack, stack.processing, target, '呪縛');
  },
};
