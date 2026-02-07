import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■弐拾式徹甲弾
  // このユニットがフィールドに出た時、対戦相手のユニットを１体選ぶ。
  // それの基本ＢＰを－２０００する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) return;

    await System.show(stack, '弐拾式徹甲弾', '基本BP-2000');

    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '基本BPを-するユニットを選択'
    );

    Effect.modifyBP(stack, stack.processing, target, -2000, { isBaseBP: true });
  },
};
