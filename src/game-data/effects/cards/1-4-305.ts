import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがアタックした時
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await EffectHelper.combine(stack, [
      {
        title: '狂姫の闊歩',
        description: '【防御禁止】を与える',
        effect: async () => {
          const [target] = await EffectHelper.pickUnit(
            stack,
            stack.processing.owner,
            'opponents',
            '【防御禁止】を与えるユニットを選択して下さい',
            1
          );
          Effect.keyword(stack, stack.processing, target, '防御禁止', {
            event: 'turnEnd',
            count: 1,
          });
        },
        condition: EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner),
      },
      {
        title: '魅入られし従者',
        description: '【道化師】を1枚引く',
        effect: () =>
          EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '道化師' }),
      },
    ]);
  },

  // あなたの【道化師】ユニットがアタックした時
  onAttack: async (stack: StackWithCard): Promise<void> => {
    if (
      !(stack.target instanceof Unit) ||
      stack.target.owner.id !== stack.processing.owner.id ||
      stack.target.id === stack.processing.id ||
      !stack.target.catalog.species?.includes('道化師') ||
      !EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    )
      return;

    await System.show(stack, '狂姫の闊歩', '【防御禁止】を与える');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '【防御禁止】を与えるユニットを選択して下さい',
      1
    );
    Effect.keyword(stack, stack.processing, target, '防御禁止', {
      event: 'turnEnd',
      count: 1,
    });
  },
};
