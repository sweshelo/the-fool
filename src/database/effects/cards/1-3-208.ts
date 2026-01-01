import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  async onAttackSelf(stack: StackWithCard<Unit>) {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );
    if (candidates.length === 0) return;

    await System.show(stack, '狂魔神槍・命滅ノ轍', '5000ダメージ');
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      candidates,
      'ダメージを与えるユニットを選択して下さい'
    );
    Effect.damage(stack, stack.processing, target, 5000);
  },

  async onOverclockSelf(stack: StackWithCard<Unit>) {
    await System.show(stack, '狂魔神槍・命滅ノ轍', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },

  async onDriveSelf(stack: StackWithCard<Unit>) {
    if (stack.processing.owner.opponent.field.length === 0) return;
    await System.show(stack, '狂魔神槍・命滅ノ轍', 'ランダムで2体に【防御禁止】');
    EffectHelper.random(stack.processing.owner.opponent.field, 2).forEach(unit =>
      Effect.keyword(stack, stack.processing, unit, '防御禁止')
    );
  },
};
