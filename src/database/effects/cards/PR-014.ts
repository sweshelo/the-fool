import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 対戦相手のターン開始時、あなたのユニットを1体選んで行動権を回復
  onTurnStart: async (stack: StackWithCard<Unit>) => {
    // 相手のターン開始時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) return;

    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
      stack.processing.owner
    );

    if (candidates.length === 0) return;

    await System.show(stack, 'リブート', '行動権を回復');
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      candidates,
      '行動権を回復するユニットを選んでください',
      1
    );
    if (!target) return;

    Effect.activate(stack, stack.processing, target, true);
  },
};
