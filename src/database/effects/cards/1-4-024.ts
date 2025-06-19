import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const candidate = stack.processing.owner.trash.filter(
      card =>
        card.catalog.color === Color.BLUE && card.catalog.type === 'unit' && card.catalog.cost <= 2
    );

    if (candidate.length > 0) {
      await System.show(
        stack,
        '創生の儀式・輪廻転生',
        'コスト2以下の青属性ユニットを4体まで【特殊召喚】'
      );
      const target = EffectHelper.random(candidate, 4);
      for (const unit of target) {
        await Effect.summon(stack, stack.processing, unit as Unit);
      }
    }
  },

  onAttackSelf: async (stack: StackWithCard): Promise<void> => {
    const candidateCard = stack.processing.owner.opponent.trash.filter(
      card => card.catalog.cost <= 1 && card.catalog.type === 'unit'
    );
    const candidateUnit = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    if (
      candidateCard.length > 0 &&
      candidateUnit.length > 0 &&
      stack.processing.owner.opponent.field.length < stack.core.room.rule.player.max.field
    ) {
      await System.show(
        stack,
        '創生の儀式・輪廻転生',
        'コスト1以下を【特殊召喚】\nユニットを1体破壊'
      );
      const [breakTarget] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidateUnit,
        '破壊するユニットを選択して下さい'
      );
      const [summonTarget] = EffectHelper.random(candidateCard);

      await Effect.summon(stack, stack.processing, summonTarget as Unit);
      Effect.break(stack, stack.processing, breakTarget as Unit, 'effect');
    }
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    const candidate = stack.processing.owner.trash.filter(
      card =>
        card.catalog.type === 'unit' && card.catalog.color === Color.BLUE && card.catalog.cost <= 3
    );
    if (candidate.length > 0 && stack.processing.owner.id !== stack.core.getTurnPlayer().id) {
      await System.show(stack, '創生の儀式・輪廻転生', 'コスト3以下の青属性ユニットを【特殊召喚】');
      const [target] = EffectHelper.random(candidate);
      await Effect.summon(stack, stack.processing, target as Unit);
    }
  },
};
