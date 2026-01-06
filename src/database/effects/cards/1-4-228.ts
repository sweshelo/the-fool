import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Choices } from '@/submodule/suit/types/game/system';

const ability = async (stack: StackWithCard): Promise<void> => {
  const targetsFilter = unit =>
    unit.owner.id === stack.processing.owner.id &&
    (unit.catalog.species?.includes('武身') ?? false);
  const targets_selectable = EffectHelper.isUnitSelectable(
    stack.core,
    targetsFilter,
    stack.processing.owner
  );
  if (targets_selectable) {
    await System.show(stack, '鏡盾の守護', '【秩序の盾】を付与');
    const choices: Choices = {
      title: '【秩序の盾】を与えるユニットを選択してください',
      type: 'unit',
      items: targets,
    };

    const [unitId] = await System.prompt(stack, stack.processing.owner.id, choices);
    const unit = stack.processing.owner.field.find(card => card.id === unitId);
    if (!unit || !(unit instanceof Unit)) throw new Error('正しいカードが選択されませんでした');

    Effect.keyword(stack, stack.processing, unit, '秩序の盾');
  }
};

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await ability(stack);
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    // 対戦相手のターン開始時は、自フィールドに武身が4体以上いる場合に限る
    if (
      stack.processing.owner.id !== stack.core.getTurnPlayer().id &&
      stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('武身')).length < 4
    )
      return;
    await ability(stack);
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    if (
      stack.processing.owner.id === stack.core.getTurnPlayer().id ||
      !(stack.processing instanceof Unit)
    )
      return;
    await EffectTemplate.reincarnate(stack, stack.processing);
  },
};
