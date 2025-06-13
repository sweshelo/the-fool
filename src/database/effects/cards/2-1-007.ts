import { System, EffectTemplate, EffectHelper, Effect } from '..';
import type { StackWithCard } from '../classes/types';

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
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
      stack.processing.owner
    );
    if (candidate) {
      await System.show(stack, 'グロウアップシールド', '基本BP+2000\n【加護】を与える');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidate,
        '対象を選択して下さい'
      );
      Effect.modifyBP(stack, stack.processing, target, 2000, { isBaseBP: true });
      Effect.keyword(stack, stack.processing, target, '加護');
    }
  },
};
