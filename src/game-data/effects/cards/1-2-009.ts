import { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { EffectHelper } from '../engine/helper';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const target = stack.target instanceof Unit ? stack.target : undefined;

    // 対象が進化ユニットでない、または対象が対戦相手のユニットでない場合は発動しない
    if (
      !target ||
      target.catalog.type !== 'advanced_unit' ||
      target.owner.id !== self.owner.opponent.id
    )
      return;

    // 対戦相手のフィールドにユニットが存在するか確認
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) return;

    await System.show(stack, '火弦のソナタ', '8000ダメージ');

    // 対戦相手のユニットを1体選ぶ
    const [damageTarget] = await EffectHelper.pickUnit(
      stack,
      self.owner,
      'opponents',
      '8000ダメージを与えるユニットを選んでください'
    );

    if (!damageTarget) return;

    Effect.damage(stack, self, damageTarget, 8000);
  },

  onPlayerAttack: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const opponent = self.owner.opponent;

    // 対戦相手のフィールドにユニットが存在するか かつ 対象が対戦相手のユニットか確認
    if (
      opponent.field.length === 0 ||
      !(stack.source instanceof Unit) ||
      stack.source.owner.id !== stack.processing.owner.opponent.id
    )
      return;

    // 対戦相手のフィールドにユニットが存在するか確認
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) return;

    await System.show(stack, '火の守護精霊', '2000ダメージ');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      self.owner,
      'opponents',
      '2000ダメージを与えるユニットを選んでください'
    );

    if (!target) return;

    Effect.damage(stack, self, target, 2000);
  },
};
