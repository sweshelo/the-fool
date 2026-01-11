import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkAttack: stack => stack.processing.owner.id === stack.source.id,
  onAttack: async (stack: StackWithCard) => {
    const isSelectable = EffectHelper.isUnitSelectable(
      stack.core,
      'opponents',
      stack.processing.owner
    );
    switch (stack.processing.lv) {
      case 1: {
        await System.show(
          stack,
          '神剣フラガラッハ',
          isSelectable ? '10000ダメージ\n1ライフダメージ' : '1ライフダメージ'
        );
        const [target] = isSelectable
          ? await EffectHelper.pickUnit(
              stack,
              stack.processing.owner,
              'opponents',
              'ダメージを与えるユニットを選択して下さい'
            )
          : [];
        if (target) Effect.damage(stack, stack.processing, target, 10000);
        Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
        break;
      }
      case 2: {
        await System.show(
          stack,
          '神剣フラガラッハ',
          isSelectable
            ? '10000ダメージ\n1ライフダメージ\nトリガーゾーンのカードを2枚まで破壊'
            : '1ライフダメージ\nトリガーゾーンのカードを2枚まで破壊'
        );
        const [target] = isSelectable
          ? await EffectHelper.pickUnit(
              stack,
              stack.processing.owner,
              'opponents',
              'ダメージを与えるユニットを選択して下さい'
            )
          : [];
        if (target) Effect.damage(stack, stack.processing, target, 10000);
        Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
        EffectHelper.random(stack.processing.owner.opponent.trigger).forEach(card =>
          Effect.move(stack, stack.processing, card, 'trash')
        );
        break;
      }
      case 3: {
        await System.show(
          stack,
          '神剣フラガラッハ',
          isSelectable
            ? '10000ダメージ\n2ライフダメージ\nトリガーゾーンのカードを2枚まで破壊'
            : '2ライフダメージ\nトリガーゾーンのカードを2枚まで破壊'
        );
        const [target] = isSelectable
          ? await EffectHelper.pickUnit(
              stack,
              stack.processing.owner,
              'opponents',
              'ダメージを与えるユニットを選択して下さい'
            )
          : [];
        if (target) Effect.damage(stack, stack.processing, target, 10000);
        Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -2);
        EffectHelper.random(stack.processing.owner.opponent.trigger, 2).forEach(card =>
          Effect.move(stack, stack.processing, card, 'trash')
        );
        break;
      }
    }
  },
};
