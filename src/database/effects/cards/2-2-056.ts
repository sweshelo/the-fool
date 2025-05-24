import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard): boolean => {
    // あなたのユニットがフィールドに出た時、あなたのフィールドに青属性ユニットがいる場合
    return (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      stack.processing.owner.field.some(unit => unit.catalog.color === Color.BLUE)
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    // 対戦相手のユニットを選択
    if (candidate.length > 0) {
      await System.show(
        stack,
        '光を呑む闇',
        '対戦相手のユニットのレベル+1\n捨札からユニットカードを1枚手札に加える\n紫ゲージ+1'
      );
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidate,
        'レベルを+1するユニットを選択してください',
        1
      );

      // 対象のレベルを+1
      Effect.clock(stack, stack.processing, target, 1);

      // 捨札にあるユニットカードをランダムで1枚手札に加える
      const unitCardsInTrash = stack.processing.owner.trash.filter(card => card instanceof Unit);
      if (unitCardsInTrash.length > 0) {
        const [randomCards] = EffectHelper.random(unitCardsInTrash, 1);
        if (randomCards) {
          Effect.move(stack, stack.processing, randomCards, 'hand');
        }
      }

      // 紫ゲージ+1
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
    }
  },
};
