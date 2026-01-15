import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

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
    const owner = stack.processing.owner;
    const self = stack.processing;

    // 自分の機械ユニットをカウント
    const machineUnits = owner.field.filter(
      unit => Array.isArray(unit.catalog.species) && unit.catalog.species.includes('機械')
    );

    // 既に自身が発行したDeltaが存在するか確認
    const delta = self.delta.find(
      delta => delta.source?.unit === self.id && delta.source?.effectCode === 'unblockable'
    );

    if (machineUnits.length >= 3) {
      // 3体以上いる場合、ブロックされない効果を付与
      if (!delta) {
        // ブロックされない効果を付与
        Effect.keyword(stack, self, self, '次元干渉', {
          cost: 0,
          source: { unit: self.id, effectCode: 'unblockable' },
        });
      }
    } else if (delta) {
      // 3体未満になった場合、効果を削除
      self.delta = self.delta.filter(
        d => d.source?.unit !== self.id || d.source?.effectCode !== 'unblockable'
      );
    }
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
