import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    return (
      EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner) &&
      (stack.processing.owner.purple ?? 0) >= 3
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const filter = (unit: Unit) => unit.lv >= 2 && unit.owner.id !== stack.processing.owner.id;
    switch (stack.processing.lv) {
      case 1: {
        await System.show(stack, 'シャドーウィドウ', '【呪縛】を付与');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          '対象を選択して下さい'
        );
        Effect.keyword(stack, stack.processing, target, '呪縛');
        break;
      }
      case 2: {
        await System.show(stack, 'シャドーウィドウ', '行動権を消費\n【呪縛】を付与');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          '対象を選択して下さい'
        );
        Effect.keyword(stack, stack.processing, target, '呪縛');
        Effect.activate(stack, stack.processing, target, false);
        break;
      }
      case 3: {
        await System.show(stack, 'シャドーウィドウ', '消滅させる');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          '対象を選択して下さい'
        );
        Effect.delete(stack, stack.processing, target);
        break;
      }
    }
  },
};
