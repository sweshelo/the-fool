import { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;

    if (!EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) return;
    await System.show(stack, 'カオスディール', 'ユニットを1体破壊');

    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '破壊するユニットを選択して下さい'
    );
    if (!target) return;

    Effect.break(stack, stack.processing, target, 'effect');
  },

  onAttackSelf: async (stack: StackWithCard) => {
    const undeadFilter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.id &&
      (unit.catalog.species?.includes('不死') ?? false);
    const opponentFilter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.opponent.id && unit.lv >= 2;

    const hasUndead = EffectHelper.isUnitSelectable(
      stack.core,
      undeadFilter,
      stack.processing.owner
    );
    const hasOpponent = EffectHelper.isUnitSelectable(
      stack.core,
      opponentFilter,
      stack.processing.owner
    );

    //【不死】とレベル2以上のユニットのいずれかが存在しない場合は処理を終了
    if (!hasUndead || !hasOpponent) return;

    await System.show(
      stack,
      'カオスディール',
      `【不死】ユニットを破壊${hasOpponent ? '\nレベル2以上のユニットを破壊' : ''}`
    );

    const [undeadTarget] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      undeadFilter,
      '破壊するユニットを選択して下さい'
    );

    const [opponentTarget] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      opponentFilter,
      '破壊するユニットを選択して下さい'
    );

    if (opponentTarget) Effect.break(stack, stack.processing, opponentTarget, 'effect');
    if (undeadTarget) Effect.break(stack, stack.processing, undeadTarget, 'effect');
  },

  onOverclockSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'カオスディール', '捨札から選んで回収');
    await EffectTemplate.revive(stack, 1);
  },
};
