import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // ■隻眼の光刃
  // このユニットがフィールドに出た時、対戦相手のフィールドに3体以上ユニットがいる場合、このユニットに【スピードムーブ】を与える。
  // あなたのフィールドに【機械】ユニットが3体以上いる場合、このユニットはブロックされない。
  // このユニットが破壊された時、あなたの捨札にある進化ユニットカード以外のコスト2以下の【機械】ユニットをランダムで1体【特殊召喚】する。

  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のフィールドに3体以上ユニットがいる場合、スピードムーブを付与
    if (opponent.field.length >= 3) {
      await System.show(stack, '隻眼の光刃', '【スピードムーブ】を付与');
      Effect.speedMove(stack, stack.processing);
    }
  },

  // あなたのフィールドに【機械】ユニットが3体以上いる場合、ブロックされない効果（フィールド効果）
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      targets: ['self'],
      condition: () =>
        stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('機械'))
          .length >= 3,
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.keyword(stack, stack.processing, target, '次元干渉', {
            cost: 0,
            source,
          });
        }
      },
      effectCode: 'unblockable',
    });
  },

  // このユニットが破壊された時の効果
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 捨札からコスト2以下の非進化機械ユニットをフィルタリング
    const eligibleUnits = owner.trash.filter(
      card =>
        card instanceof Unit &&
        card.catalog.cost <= 2 &&
        Array.isArray(card.catalog.species) &&
        card.catalog.species.includes('機械') &&
        card.catalog.type !== 'advanced_unit' // 進化ユニットではない
    );

    if (eligibleUnits.length > 0 && owner.field.length < 5) {
      await System.show(stack, '隻眼の光刃', '捨札から【機械】を【特殊召喚】');

      // ランダムで1体選択
      const [selectedUnit] = EffectHelper.random(eligibleUnits, 1);
      if (selectedUnit instanceof Unit) {
        // 特殊召喚
        await Effect.summon(stack, stack.processing, selectedUnit);
      }
    }
  },
};
