import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // 起動・フォース＜ウィルス・黙＞
  isBootable: (core: Core, self: Unit): boolean => {
    return (
      self.owner.trigger_selectable &&
      EffectHelper.candidate(core, unit => unit.owner.id === self.owner.id, self.owner).length > 0
    );
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '起動・妖精王の覇気',
      'トリガーゾーンを1枚破壊\n【スピードムーブ】を与える'
    );
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;
    EffectHelper.random(stack.processing.owner.trigger, 1).forEach(card =>
      Effect.move(stack, stack.processing, card, 'trash')
    );
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '【スピードムーブ】を与えるユニットを選択して下さい',
      1
    );
    Effect.speedMove(stack, target);
  },

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    if (!stack.processing.owner.purple || stack.processing.owner.purple < 3) return;
    const breakCount = stack.processing.owner.opponent.field.filter(
      unit => unit.currentBP - 3000 <= 0
    ).length;
    await System.show(
      stack,
      '妖精王の覇気',
      `基本BP-3000${breakCount >= 2 ? '\n2ライフダメージ' : breakCount >= 1 ? '\n1ライフダメージ' : ''}`
    );

    stack.processing.owner.opponent.field.forEach(unit =>
      Effect.modifyBP(stack, stack.processing, unit, -3000, { isBaseBP: true })
    );
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, -3);
    if (breakCount > 0)
      Effect.modifyLife(
        stack,
        stack.processing,
        stack.processing.owner.opponent,
        breakCount >= 2 ? -2 : -1
      );
  },
};
