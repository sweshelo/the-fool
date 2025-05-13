import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■大天使の加護
  // このユニットがフィールドに出た時、あなたの全てのユニットの行動権を回復する。
  // ■サポーター／天使
  // あなたの【天使】ユニットのBPを+1000する。

  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '大天使の加護', '味方全体の行動権を回復\n【天使】のBPを+1000');

    // 自分の全てのユニットの行動権を回復
    for (const unit of owner.field) {
      Effect.activate(stack, stack.processing, unit, true);
    }
  },

  // フィールド効果：天使ユニットのBPを+1000する
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    const owner = stack.processing.owner;

    // 自分の天使ユニットを対象にする
    owner.field.forEach(unit => {
      // 天使ユニットか確認
      if (unit.catalog.species?.includes('天使')) {
        // 既にこのユニットが発行したDeltaが存在するか確認
        const delta = unit.delta.find(
          d => d.source?.unit === stack.processing.id && d.source?.effectCode === 'サポーター／天使'
        );

        if (delta && delta.effect.type === 'bp') {
          // 既存のDeltaを更新
          delta.effect.diff = 1000;
        } else {
          // 新しいDeltaを発行
          Effect.modifyBP(stack, stack.processing, unit, 1000, {
            source: { unit: stack.processing.id, effectCode: 'サポーター／天使' },
          });
        }
      } else {
        // 天使でなくなった場合、このユニットが付与したBP上昇を削除
        unit.delta = unit.delta.filter(
          d =>
            !(d.source?.unit === stack.processing.id && d.source?.effectCode === 'サポーター／天使')
        );
      }
    });
  },
};
