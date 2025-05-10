import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const targets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id && unit.catalog.cost <= 3,
      stack.processing.owner
    );
    if (
      targets.length > 0 &&
      stack.processing.owner.field.length < stack.core.room.rule.player.max.field
    ) {
      await System.show(stack, '醒命の光矢', 'コスト3以下を【複製】');
      const choices: Choices = {
        title: '【複製】するユニットを選択してください',
        type: 'unit',
        items: targets,
      };

      const [unitId] = await System.prompt(stack, stack.processing.owner.id, choices);
      const unit = targets.find(card => card.id === unitId);
      if (!unit || !(unit instanceof Unit))
        throw new Error('正しいカードが選択されませんでした', { cause: unit });

      await Effect.clone(stack, stack.processing, unit, stack.processing.owner);
    }
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    if (
      stack.processing.owner.id !== stack.core.getTurnPlayer().id ||
      !(stack.processing instanceof Unit) ||
      stack.processing.owner.trash.length <= 0
    )
      return;

    await System.show(stack, '醒命の光矢', '捨札を消滅させる');
    const [target] = EffectHelper.random(stack.processing.owner.trash);
    if (target) Effect.move(stack, stack.processing, target, 'delete');
  },

  onBreakSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.delete.length <= 0) return;

    await System.show(stack, '醒命の光矢', '消滅から1枚回収');
    const choices: Choices = {
      title: '手札に加えるカードを選択してください',
      type: 'card',
      items: stack.processing.owner.delete,
      count: 1,
    };
    const [cardId] = await System.prompt(stack, stack.processing.owner.id, choices);
    const card = stack.processing.owner.delete.find(card => card.id === cardId);

    if (!card) throw new Error('正しいカードが選択されませんでした');
    Effect.move(stack, stack.processing, card, 'hand');
  },
};
