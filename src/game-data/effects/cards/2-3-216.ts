import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing instanceof Unit === false) return;
    if (stack.processing.owner.opponent.field.length > 0) {
      // 対戦相手のBPが最も高いユニットからランダムで1体破壊する
      await System.show(stack, '肉弾チェーンソー', 'ユニットを破壊\nデスカウンター[3]を付与');
      const max = Math.max(...stack.processing.owner.opponent.field.map(unit => unit.currentBP));
      const candidate = stack.processing.owner.opponent.field.filter(
        unit => unit.currentBP === max
      );
      EffectHelper.random(candidate).forEach(unit => Effect.break(stack, stack.processing, unit));
    } else {
      await System.show(stack, '肉弾チェーンソー', 'デスカウンター[3]を付与');
    }
    // このユニットにデスカウンター［3］を与える
    Effect.death(stack, stack.processing, stack.processing, 3);
  },

  // 自分のターン終了時
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分のターン終了時のみ発動
    if (opponent.id !== stack.core.getTurnPlayer().id) {
      // このユニットのデスカウンター以下のコストの青属性ユニットを捨札からランダムで1体【特殊召喚】する
      const deathCounter = stack.processing.delta.find(delta => delta.effect.type === 'death');
      if (!deathCounter) return;
      const targets = owner.trash.filter(
        unit =>
          unit.catalog.type === 'unit' &&
          unit.catalog.color === Color.BLUE &&
          unit.catalog.cost <= deathCounter.count
      );
      if (targets.length === 0) return;

      await System.show(
        stack,
        '道連れボディプレス',
        `コスト${deathCounter.count}以下の青属性ユニットを【特殊召喚】`
      );
      const [target] = EffectHelper.random(targets);
      if (target instanceof Unit) {
        await Effect.summon(stack, stack.processing, target);
      }
    }
  },

  // このユニットが破壊された時
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    if (opponent.field.length === 0) return;

    await System.show(stack, '道連れボディプレス', 'デスカウンター[1]を付与');

    // 対戦相手のBPが最も高いユニットからランダムで1体にデスカウンター［1］を与える
    const max = Math.max(...stack.processing.owner.opponent.field.map(unit => unit.currentBP));
    const candidate = stack.processing.owner.opponent.field.filter(unit => unit.currentBP === max);
    EffectHelper.random(candidate).forEach(unit => Effect.death(stack, stack.processing, unit, 1));
  },
};
