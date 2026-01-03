import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■クロック・アップ
  // あなたのこのカード以外の【昆虫】ユニットがフィールドに出るたび、このユニットのレベルを+1する。
  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 召喚されたユニットが自分の昆虫ユニットでこのユニット以外かチェック
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.id !== stack.processing.id && // 自身以外
      stack.target.catalog.species?.includes('昆虫') && // 昆虫ユニット
      stack.processing.lv < 3
    ) {
      await System.show(stack, 'クロック・アップ', 'レベル+1');

      // レベルを+1する
      Effect.clock(stack, stack.processing, stack.processing, 1);
    }
  },

  // ■繁殖
  // このユニットがオーバークロックした時、あなたの【昆虫】ユニットの基本BPを+1000する。
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '繁殖', '【昆虫】ユニットの基本BP+1000');

    // プレイヤーのフィールド上の昆虫ユニットすべてにBP+1000
    const insectUnits = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('昆虫')
    );

    for (const unit of insectUnits) {
      // 既にこのユニットが発行したDeltaが存在するか確認
      const delta = unit.delta.find(
        d => d.source?.unit === stack.processing.id && d.source?.effectCode === '繁殖'
      );

      if (delta && delta.effect.type === 'bp') {
        // Deltaを編集する
        delta.effect.diff = 1000;
      } else {
        // 新しいDeltaを追加
        Effect.modifyBP(stack, stack.processing, unit, 1000, { isBaseBP: true });
      }
    }
  },
};
