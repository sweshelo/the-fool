import { System, EffectTemplate, EffectHelper, Effect } from '..';
import type { StackWithCard } from '../schema/types';

export const effects = {
  onDriveSelf: async (stack: StackWithCard) => {
    if (stack.processing.owner.hand.length > 0) {
      await System.show(stack, 'クイック・ドロー', '手札を1枚消滅\nトリガーカードを1枚引く');
      const [target] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        stack.processing.owner.hand,
        '消滅させるカードを選択して下さい'
      );
      Effect.move(stack, stack.processing, target, 'delete');
      EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
    }
  },

  onOverclockSelf: async (stack: StackWithCard) => {
    if (EffectHelper.isUnitSelectable(stack.core, 'owns', stack.processing.owner)) {
      await System.show(stack, 'グロウアップシールド', '基本BP+2000\n【加護】を与える');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'owns',
        '対象を選択して下さい'
      );
      Effect.modifyBP(stack, stack.processing, target, 2000, { isBaseBP: true });
      Effect.keyword(stack, stack.processing, target, '加護');
    }
  },
};
