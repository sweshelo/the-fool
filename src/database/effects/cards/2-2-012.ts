import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Choices } from '@/submodule/suit/types/game/system';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '加護', '効果に選ばれない');
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },

  isBootable: (core: Core, self: Unit) => {
    const selfFilter = (unit: Unit) => unit.owner.id === self.owner.id;
    const opponentFilter = (unit: Unit) => unit.owner.id === self.owner.opponent.id;
    return (
      EffectHelper.isUnitSelectable(core, selfFilter, self.owner) &&
      EffectHelper.isUnitSelectable(core, opponentFilter, self.owner)
    );
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '起動・善神の判決', 'お互いのユニットを消滅');
    const targets: Unit[] = [];

    for (const candidate of [
      EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id === stack.processing.owner.id,
        stack.processing.owner
      ),
      EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id !== stack.processing.owner.id,
        stack.processing.owner
      ),
    ]) {
      const choices: Choices = {
        title: '消滅させるユニットを選択してください',
        type: 'unit',
        items: candidate,
      };

      const [unitId] = await System.prompt(stack, stack.processing.owner.id, choices);
      const unit = candidate.find(card => card.id === unitId);
      if (!unit) throw new Error('正しいカードが選択されませんでした');

      targets.push(unit);
    }

    targets.forEach(unit => Effect.delete(stack, stack.processing, unit));
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    const candidate = stack.processing.owner.delete.filter(
      card => card instanceof Unit && card.catalog.cost <= 3
    ) as Unit[];
    if (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      stack.processing.owner.field.length <= 4 &&
      candidate_selectable
    ) {
      await System.show(stack, '天満ちる神の調べ', 'コスト3以下を【特殊召喚】');
      await Promise.all(
        EffectHelper.random(candidate, 1).map(unit => Effect.summon(stack, stack.processing, unit))
      );
    }
  },
};
