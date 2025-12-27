import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Card, Unit } from '@/package/core/class/card';

const onLost = async (stack: StackWithCard<Unit>) => {
  const candidates = EffectHelper.candidate(
    stack.core,
    unit => unit.owner.id !== stack.processing.owner.id,
    stack.processing.owner
  );
  if (candidates.length > 0) {
    await System.show(stack, '燃え移る命の灯り', '3000ダメージ');
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      candidates,
      'ダメージを与えるユニットを選択して下さい'
    );
    Effect.damage(stack, stack.processing, target, 3000);
  }
};

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const [target] = EffectHelper.random(stack.processing.owner.opponent.trigger);
    if (target) {
      await System.show(stack, '焔に染まる少女の想い', 'トリガーゾーンを1枚破壊');
      Effect.move(stack, stack.processing, target, 'trash');

      await onLost(stack);
    }
  },

  onLost: async (stack: StackWithCard<Unit>) => {
    if (
      stack.source.id !== stack.processing.id &&
      stack.source instanceof Card &&
      stack.source.owner.id === stack.processing.owner.id &&
      stack.target instanceof Card &&
      stack.target.owner.id === stack.processing.owner.opponent.id
    )
      await onLost(stack);
  },
};
