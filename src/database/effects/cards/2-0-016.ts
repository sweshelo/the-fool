import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';
import type { Choices } from '@/submodule/suit/types/game/system';

const onBattle = async (stack: StackWithCard) => {
  await System.show(stack, '永久凍土', '捨札を3枚消滅');
  EffectHelper.random(stack.processing.owner.trash, 3).forEach(card =>
    Effect.move(stack, stack.processing, card, 'delete')
  );
};

export const effects: CardEffects = {
  onTurnStartInTrash: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit))
      throw new Error('Unitではないオブジェクトが指定されました');

    const isOpponentTurn = stack.processing.owner.id !== stack.core.getTurnPlayer().id;
    const isAtLeast25BlueCardsInTrash =
      stack.processing.owner.trash.filter(card => card.catalog.color === Color.BLUE).length >= 25;
    const hasFieldSpace = stack.processing.owner.field.length <= 4;

    if (isOpponentTurn && isAtLeast25BlueCardsInTrash && hasFieldSpace) {
      // oxlint-disable-next-line no-floating-promises
      System.show(stack, '永久凍土', '【特殊召喚】');
      await Effect.summon(stack, stack.processing, stack.processing);
    }
  },

  onAttackSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),
  onBlockSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),
  onBreakSelf: async (stack: StackWithCard): Promise<void> => await onBattle(stack),

  onClockupSelf: async (stack: StackWithCard): Promise<void> => {
    const isClockUpToLv3 = stack.processing.lv === 3;
    const targetsFilter = (unit: Unit) =>
      unit.owner.id !== stack.processing.owner.id && unit.lv >= 2;
    const targets_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      targetsFilter,
      stack.processing.owner
    );

    if (isClockUpToLv3 && targets_selectable) {
      await System.show(stack, '絶対零度の息吹', 'レベル2以上のユニットを1体破壊');
      const choices: Choices = {
        title: '破壊するユニットを選択してください',
        type: 'unit',
        items: targets,
      };

      const [unitId] = await System.prompt(stack, stack.processing.owner.id, choices);
      const unit = targets.find(card => card.id === unitId);
      if (!unit || !(unit instanceof Unit)) throw new Error('正しいカードが選択されませんでした');

      Effect.break(stack, stack.processing, unit, 'effect');
    }
  },
};
