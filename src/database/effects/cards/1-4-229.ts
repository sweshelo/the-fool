import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

const ability = async (stack: StackWithCard): Promise<void> => {
  const hasFieldSpace = stack.processing.owner.field.length <= 4;
  const targets = stack.processing.owner.deck.filter(
    card => card.catalog.species?.includes('武身') && card.catalog.cost <= 2
  );

  if (hasFieldSpace && targets.length > 0) {
    await System.show(stack, '叢雲の覇気', 'コスト2以下の【武身】を【特殊召喚】');
    const choices: Choices = {
      title: '【特殊召喚】するユニットを選択してください',
      type: 'card',
      items: targets,
      count: 1,
    };

    const [unitId] = await System.prompt(stack, stack.processing.owner.id, choices);
    const unit = stack.processing.owner.deck.find(card => card.id === unitId);
    if (!unit || !(unit instanceof Unit)) throw new Error('正しいカードが選択されませんでした');

    await Effect.summon(stack, stack.processing, unit);
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
