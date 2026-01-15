import { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { EffectHelper } from '../engine/helper';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;

    // 対戦相手のフィールドにユニットが存在するか確認
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) return;
    await System.show(stack, '封印の湖', '【呪縛】を付与');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      self.owner,
      'opponents',
      '【呪縛】を与えるユニットを選んでください'
    );

    Effect.keyword(stack, self, target, '呪縛');
  },
};
