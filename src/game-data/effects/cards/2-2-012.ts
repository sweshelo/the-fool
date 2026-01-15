import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '加護', '効果に選ばれない');
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },

  isBootable: (core: Core, self: Unit) => {
    return (
      EffectHelper.isUnitSelectable(core, 'owns', self.owner) &&
      EffectHelper.isUnitSelectable(core, 'opponents', self.owner)
    );
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '起動・善神の判決', 'お互いのユニットを消滅');

    const targets = [
      ...(await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'owns',
        '消滅させるユニットを選択してください'
      )),
      ...(await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        '消滅させるユニットを選択してください'
      )),
    ];

    targets.forEach(unit => Effect.delete(stack, stack.processing, unit));
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    const candidate = stack.processing.owner.delete.filter(
      (card): card is Unit => card.catalog.type === 'unit' && card.catalog.cost <= 3
    );
    if (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      stack.processing.owner.field.length <= 4 &&
      candidate.length > 0
    ) {
      await System.show(stack, '天満ちる神の調べ', 'コスト3以下を【特殊召喚】');
      await Promise.all(
        EffectHelper.random(candidate, 1).map(unit => Effect.summon(stack, stack.processing, unit))
      );
    }
  },
};
