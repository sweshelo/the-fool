import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたの【不死】ユニットが破壊されるたび、対戦相手のユニットを1体選ぶ。それに【沈黙】を与える
  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    const brokenUnit = stack.target;

    // 破壊されたのが自分の【不死】ユニットか確認
    if (
      !(brokenUnit instanceof Unit) ||
      brokenUnit.owner.id !== stack.processing.owner.id ||
      !brokenUnit.catalog.species?.includes('不死')
    ) {
      return;
    }

    const owner = stack.processing.owner;

    // 対戦相手のフィールドにユニットがいるか確認
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) return;

    await System.show(stack, '恨み、晴らします。', '【沈黙】付与');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '【沈黙】を与えるユニットを選択'
    );

    Effect.keyword(stack, stack.processing, target, '沈黙');
  },
};
