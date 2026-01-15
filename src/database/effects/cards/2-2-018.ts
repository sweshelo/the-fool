import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '不滅', 'ダメージを受けない');
    Effect.keyword(stack, stack.processing, stack.processing, '不滅');
  },

  isBootable: (core: Core, self: Unit) => {
    return (
      self.owner.trash.length >= 3 && EffectHelper.isUnitSelectable(core, 'opponents', self.owner)
    );
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '起動・悪神の判決',
      '捨札を3枚デッキに戻す\nユニットに【沈黙】を与え破壊する'
    );
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '破壊するユニットを選択してください'
    );

    EffectHelper.random(stack.processing.owner.trash, 3).forEach(card =>
      Effect.move(stack, stack.processing, card, 'deck')
    );
    Effect.keyword(stack, stack.processing, target, '沈黙');
    Effect.break(stack, stack.processing, target, 'effect');
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    if (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      stack.processing.owner.deck.length > 0
    ) {
      await System.show(stack, '闇を蝕む混沌', '捨札に5枚送る');
      EffectHelper.random(stack.processing.owner.deck, 5).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trash')
      );
    }
  },

  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '闇を蝕む混沌', '基本BP-3000');
    Effect.modifyBP(stack, stack.processing, stack.processing, -3000, { isBaseBP: true });
  },
};
