import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

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
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.keyword(stack, stack.processing, target, '加護', { source });
        }
      },
      condition: () =>
        stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('天使'))
          .length >= 2,
      effectCode: 'アステルの守護',
      targets: ['self'],
    });
  },
};
