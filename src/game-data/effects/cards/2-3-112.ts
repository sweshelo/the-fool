import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■ラブリーシュート
  // このユニットがフィールドに出た時、あなたは進化ユニットカードを1枚引く。
  // ■アステルの守護
  // あなたのフィールドに【天使】ユニットが2体以上いる場合、このユニットに【加護】を与える。

  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      'ラブリーシュート&アステルの守護',
      '進化ユニットカードを1枚引く\n【加護】を得る'
    );
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['advanced_unit'] });
  },

  // フィールド効果：天使ユニットが2体以上いる場合、加護を付与
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    const owner = stack.processing.owner;

    // 天使ユニットの数を取得
    const angelCount = owner.field.filter(unit => unit.catalog.species?.includes('天使')).length;

    // 加護の付与・削除処理
    // 既にこのユニットが発行したDeltaが存在するか確認
    const delta = stack.processing.delta.find(
      d => d.source?.unit === stack.processing.id && d.source?.effectCode === 'アステルの守護'
    );

    if (angelCount >= 2) {
      // 天使が2体以上いて、まだ加護を持っていなければ付与
      if (!delta) {
        Effect.keyword(stack, stack.processing, stack.processing, '加護', {
          source: { unit: stack.processing.id, effectCode: 'アステルの守護' },
        });
      }
    } else {
      // 天使が2体未満の場合、このユニットが付与した加護を削除
      if (delta) {
        stack.processing.delta = stack.processing.delta.filter(
          d =>
            !(d.source?.unit === stack.processing.id && d.source?.effectCode === 'アステルの守護')
        );
      }
    }
  },
};
