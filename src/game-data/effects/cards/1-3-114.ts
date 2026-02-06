import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'サポーター／不死', '【不死】のBP+1000');
  },

  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のターン時のみ
    if (opponent.id !== stack.core.getTurnPlayer().id) return;

    // 効果によってあなたのユニットが破壊された
    if (!(stack.target instanceof Unit)) return;
    if (stack.target.owner.id !== owner.id) return;
    if (!EffectHelper.isBreakByEffect(stack)) return;

    // あなたのフィールドのユニットが4体以下の場合
    if (owner.field.length > 4) return;

    // 捨札にあるコスト2以下の【不死】ユニット
    const targets = owner.trash.filter(
      unit =>
        unit.catalog.type === 'unit' &&
        unit.catalog.species?.includes('不死') &&
        unit.catalog.cost <= 2
    );
    const [target] = EffectHelper.random(targets, 1);
    if (!target || !(target instanceof Unit)) return;

    await System.show(stack, '冥妃の近衛兵', 'コスト2以下の【不死】を【特殊召喚】');
    await Effect.summon(stack, stack.processing, target);
  },

  // あなたの【不死】ユニットのBPを+1000する。
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns'],
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, unit, 1000, { source });
        }
      },
      effectCode: 'サポーター／不死',
      condition: target => target.catalog.species?.includes('不死') ?? false,
    });
  },
};
