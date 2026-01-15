import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 【スピードムーブ】（召喚時付与）
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');
    Effect.speedMove(stack, stack.processing);
  },

  // ■選略・システムδ
  // このユニットがアタックした時
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;

    // BP増加は常に可能
    const isOption2Available = EffectHelper.isUnitSelectable(
      stack.core,
      filter,
      stack.processing.owner
    );

    const [choice] = !isOption2Available
      ? ['1']
      : await System.prompt(stack, stack.processing.owner.id, {
          title: '選略・システムδ',
          type: 'option',
          items: [
            { id: '1', description: 'BP+3000' },
            { id: '2', description: '1体選び3000ダメージ' },
          ],
        });

    if (choice === '1') {
      await System.show(stack, 'システムδ', 'BP+3000');
      Effect.modifyBP(stack, stack.processing, stack.processing, 3000, {
        event: 'turnEnd',
        count: 1,
      });
    } else if (
      choice === '2' &&
      EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
    ) {
      await System.show(stack, 'システムδ', '3000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'ダメージを与えるユニットを選択'
      );
      Effect.damage(stack, stack.processing, target, 3000);
    }
  },
};
