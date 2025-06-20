import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import { EffectTemplate } from '../classes/templates';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (opponentUnits.length === 0) return;
    System.show(stack, 'カオスディール', '破壊');

    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      opponentUnits,
      '破壊するユニットを選択して下さい'
    );
    if (!target) return;

    Effect.break(stack, stack.processing, target, 'effect');
  },

  onAttackSelf: async (stack: StackWithCard) => {
    const undeadUnits = EffectHelper.candidate(
      stack.core,
      unit =>
        unit.owner.id === stack.processing.owner.id &&
        (unit.catalog.species?.includes('不死') ?? false),
      stack.processing.owner
    );
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id && unit.lv >= 2,
      stack.processing.owner
    );

    if (undeadUnits.length === 0) return;

    System.show(
      stack,
      'カオスディール',
      `【不死】ユニットを破壊${opponentUnits.length > 0 ? '\nレベル2以上のユニットを破壊' : ''}`
    );

    const [undeadTarget] =
      undeadUnits.length > 0
        ? await EffectHelper.selectUnit(
            stack,
            stack.processing.owner,
            undeadUnits,
            '破壊するユニットを選択して下さい'
          )
        : [];

    const [opponentTarget] =
      opponentUnits.length > 0
        ? await EffectHelper.selectUnit(
            stack,
            stack.processing.owner,
            opponentUnits,
            '破壊するユニットを選択して下さい'
          )
        : [];

    if (opponentTarget) Effect.break(stack, stack.processing, opponentTarget, 'effect');
    if (undeadTarget) Effect.break(stack, stack.processing, undeadTarget, 'effect');
  },

  onOverclockSelf: async (stack: StackWithCard) => {
    System.show(stack, 'カオスディール', '捨札から選んで回収');
    await EffectTemplate.revive(stack, 1);
  },
};
