import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 対戦相手のターン開始時、あなたのユニットを1体選んで行動権を回復
  onTurnStart: async (stack: StackWithCard<Unit>) => {
    // 相手のターン開始時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) return;

    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;

    if (!EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) return;

    await System.show(stack, 'リブート', '行動権を回復');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '行動権を回復するユニットを選んでください'
    );
    if (!target) return;

    Effect.activate(stack, stack.processing, target, true);
  },
};
