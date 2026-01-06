import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkBreak: (stack: StackWithCard) => {
    // 対戦相手のフィールドに選択可能なユニットがいるかチェック
    const filterLevel = stack.processing.lv >= 2 ? 1 : 2;
    const targetsFilter = (unit: Unit) =>
      unit.lv >= filterLevel && unit.owner.id !== stack.processing.owner.id;
    const targets_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      targetsFilter,
      stack.processing.owner
    );
    return targets_selectable;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onBreak: async (stack: StackWithCard): Promise<void> => {
    switch (stack.processing.lv) {
      case 1: {
        await System.show(stack, '憎しみの藁人形', 'レベル2以上のユニットを破壊');
        const targetsFilter = (unit: Unit) =>
          unit.lv >= 2 && unit.owner.id !== stack.processing.owner.id;
        const targets_selectable = EffectHelper.isUnitSelectable(
          stack.core,
          targetsFilter,
          stack.processing.owner
        );
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          targetsFilter,
          '破壊するユニットを選択して下さい'
        );
        Effect.break(stack, stack.processing, target, 'effect');
        break;
      }
      case 2: {
        await System.show(stack, '憎しみの藁人形', 'ユニットを破壊');
        const targetsFilter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
        const targets_selectable = EffectHelper.isUnitSelectable(
          stack.core,
          targetsFilter,
          stack.processing.owner
        );
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          targetsFilter,
          '破壊するユニットを選択して下さい'
        );
        Effect.break(stack, stack.processing, target, 'effect');
        break;
      }
      case 3: {
        await System.show(stack, '憎しみの藁人形', 'ユニットを破壊\n1ライフダメージ');
        const targetsFilter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
        const targets_selectable = EffectHelper.isUnitSelectable(
          stack.core,
          targetsFilter,
          stack.processing.owner
        );
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          targetsFilter,
          '破壊するユニットを選択して下さい'
        );
        Effect.break(stack, stack.processing, target, 'effect');
        Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
        break;
      }
    }
  },
};
