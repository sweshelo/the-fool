import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

const onBattle = async (stack: StackWithCard) => {
  await System.show(stack, 'オーシャンヒロイン', '捨札を2枚消滅');
  EffectHelper.random(stack.processing.owner.trash, 2).forEach(card =>
    Effect.move(stack, stack.processing, card, 'delete')
  );
};

export const effects: CardEffects = {
  onTurnStartInTrash: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit))
      throw new Error('Unitではないオブジェクトが指定されました');

    const isOpponentTurn = stack.processing.owner.id !== stack.core.getTurnPlayer().id;
    const isAtLeast20BlueCardsInTrash =
      stack.processing.owner.trash.filter(card => card.catalog.color === Color.BLUE).length >= 20;
    const hasFieldSpace = stack.processing.owner.field.length <= 4;

    if (isOpponentTurn && isAtLeast20BlueCardsInTrash && hasFieldSpace) {
      await System.show(stack, 'オーシャンヒロイン', '【特殊召喚】');
      Effect.summon(stack, stack.processing, stack.processing);
    }
  },

  onAttackSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),
  onBlockSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),
  onBreakSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),

  onClockSelf: async (stack: StackWithCard): Promise<void> => {
    const isClockUpToLv3 = stack.processing.lv === 3;
    const targets = stack.processing.owner.opponent.field;

    if (isClockUpToLv3 && targets.length > 0) {
      await System.show(stack, 'オーシャンヒロイン', '敵全体のレベル+1');
      targets.forEach(unit => Effect.clock(stack, stack.processing, unit, 1, true));
    }
  },
};
