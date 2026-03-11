import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

const onBattle = async (stack: StackWithCard) => {
  if (stack.processing.owner.trash.length === 0) return;
  await System.show(stack, '永久凍土', '捨札を3枚消滅');
  EffectHelper.random(stack.processing.owner.trash, 3).forEach(card =>
    Effect.delete(stack, stack.processing, card)
  );
};

const clockupEffect = async (stack: StackWithCard): Promise<void> => {
  if (!(stack.target instanceof Unit)) return;
  const isClockUpToLv3 =
    stack.target.owner.id === stack.processing.owner.id && stack.target.lv === 3;
  const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id && unit.lv >= 2;

  if (isClockUpToLv3 && EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
    await System.show(stack, '絶対零度の息吹', 'レベル2以上のユニットを1体破壊');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '破壊するユニットを選択してください'
    );
    Effect.break(stack, stack.processing, target, 'effect');
  }
};

export const effects: CardEffects = {
  onTurnStartInTrash: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit))
      throw new Error('Unitではないオブジェクトが指定されました');

    const isOpponentTurn = stack.processing.owner.id !== stack.core.getTurnPlayer().id;
    const isAtLeast25BlueCardsInTrash =
      stack.processing.owner.trash.filter(card => card.catalog.color === Color.BLUE).length >= 25;
    const hasFieldSpace =
      stack.processing.owner.field.length < stack.core.room.rule.player.max.field;

    if (isOpponentTurn && isAtLeast25BlueCardsInTrash && hasFieldSpace) {
      // oxlint-disable-next-line no-floating-promises
      System.show(stack, '永久凍土', '【特殊召喚】');
      await Effect.summon(stack, stack.processing, stack.processing);
    }
  },

  onAttackSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),
  onBlockSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),
  onBreakSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),

  onClockupSelf: clockupEffect,
  onClockup: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;
    if (stack.processing.id !== stack.target.id) {
      await clockupEffect(stack);
    }
  },
};
