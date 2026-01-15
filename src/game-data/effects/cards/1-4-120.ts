import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 【不屈】
  // ■ラッキー☆スター
  // ユニットがアタックするたび、このユニットの基本BPを+1000する。
  // ■フェイタル☆アロー
  // あなたの【天使】ユニットに【貫通】を与える。

  // 召喚時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'フェイタル☆アロー', '【不屈】\n【天使】に【貫通】を付与');

    // 不屈を付与
    Effect.keyword(stack, stack.processing, stack.processing, '不屈');
  },

  // アタック時の効果
  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    // どのユニットがアタックしてもこの効果は発動する
    await System.show(stack, 'ラッキー☆スター', '基本BP+1000');

    // 基本BPを+1000する
    Effect.modifyBP(stack, stack.processing, stack.processing, 1000, {
      isBaseBP: true,
    });
  },

  // フィールド効果：天使ユニットに貫通を与える
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    const owner = stack.processing.owner;

    // 自分のフィールドの天使ユニットを対象にする
    owner.field.forEach(unit => {
      // 天使ユニットか確認
      if (unit.catalog.species?.includes('天使')) {
        // 既にこのユニットが発行したDeltaが存在するか確認
        const delta = unit.delta.find(
          d =>
            d.source?.unit === stack.processing.id && d.source?.effectCode === 'フェイタル☆アロー'
        );

        // 既にDeltaが存在しない場合のみ貫通を付与
        if (!delta) {
          Effect.keyword(stack, stack.processing, unit, '貫通', {
            source: { unit: stack.processing.id, effectCode: 'フェイタル☆アロー' },
          });
        }
      } else {
        // 天使でなくなった場合、このユニットが付与した貫通を削除
        unit.delta = unit.delta.filter(
          d =>
            !(
              d.source?.unit === stack.processing.id && d.source?.effectCode === 'フェイタル☆アロー'
            )
        );
      }
    });
  },
};
