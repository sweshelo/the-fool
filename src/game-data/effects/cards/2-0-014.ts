import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

const onBattle = async (stack: StackWithCard) => {
  if (stack.processing.owner.trash.length === 0) return;
  await System.show(stack, 'ミーナ頑張る！', '捨札を1枚消滅');
  EffectHelper.random(stack.processing.owner.trash).forEach(card =>
    Effect.delete(stack, stack.processing, card)
  );
};

export const effects: CardEffects = {
  onTurnStartInTrash: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit))
      throw new Error('Unitではないオブジェクトが指定されました');

    const isOpponentTurn = stack.processing.owner.id !== stack.core.getTurnPlayer().id;
    const isAtLeast15BlueCardsInTrash =
      stack.processing.owner.trash.filter(card => card.catalog.color === Color.BLUE).length >= 15;
    const hasFieldSpace =
      stack.processing.owner.field.length < stack.core.room.rule.player.max.field;

    if (isOpponentTurn && isAtLeast15BlueCardsInTrash && hasFieldSpace) {
      // oxlint-disable-next-line no-floating-promises
      System.show(stack, 'ミーナ頑張る！', '【特殊召喚】');
      await Effect.summon(stack, stack.processing, stack.processing);
    }
  },

  onAttackSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),
  onBlockSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),
  onBreakSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),
};
