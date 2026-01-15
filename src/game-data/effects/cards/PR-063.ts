import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  //【貫通】
  //【消滅効果耐性】
  //（対戦相手の効果によって消滅しない。この能力はこのユニットがフィールドに出た時に付与される）
  //■闘士／昆虫・悪魔
  //このユニットのBPは、あなたのフィールドの【昆虫】と【悪魔】1体につき+1000される。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '貫通＆消滅効果耐性',
      'ブロックを貫通してプレイヤーにダメージを与える\n対戦相手の効果によって消滅しない'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
    Effect.keyword(stack, stack.processing, stack.processing, '消滅効果耐性');
  },

  //闘士／昆虫・悪魔：フィールドの【昆虫】と【悪魔】1体につき+1000される
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // すでに自身が発行したDeltaがあるか確認
    const delta = stack.processing.delta.find(
      delta =>
        delta.source?.unit === stack.processing.id &&
        delta.source?.effectCode === '闘士／昆虫・悪魔'
    );

    // 自分フィールドにいる【昆虫】と【悪魔】ユニットの数をカウント
    const bugandDevilCount = stack.processing.owner.field.filter(
      unit => unit.catalog.species?.includes('昆虫') || unit.catalog.species?.includes('悪魔')
    ).length;

    // BP増加量を計算
    const bpBoost = bugandDevilCount * 1000;

    if (delta && delta.effect.type === 'bp') {
      // Deltaを更新
      delta.effect.diff = bpBoost;
    } else {
      // 新規にDeltaを生成
      Effect.modifyBP(stack, stack.processing, stack.processing, bpBoost, {
        source: {
          unit: stack.processing.id,
          effectCode: '闘士／昆虫・悪魔',
        },
      });
    }
  },
};
