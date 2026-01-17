import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '黄金蝶の鱗粉', '【加護】\n【神獣】のBP+3000\n【不滅】を付与');
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    // 【神獣】ユニットのBPを+3000し、【不滅】を付与
    stack.processing.owner.field
      .filter(unit => unit.catalog.species?.includes('神獣'))
      .forEach(unit => {
        // 既にこのユニットが発行したDeltaが存在するか確認
        const delta = unit.delta.find(
          delta =>
            delta.source?.unit === stack.processing.id &&
            delta.source?.effectCode === '黄金蝶の鱗粉'
        );

        if (delta) {
          // Deltaを編集する
          if (delta.effect.type === 'bp') {
            delta.effect.diff = 3000;
          }
        } else {
          // 新しいDeltaを発行
          Effect.modifyBP(stack, stack.processing, unit, 3000, {
            source: { unit: stack.processing.id, effectCode: '黄金蝶の鱗粉' },
          });
          Effect.keyword(stack, stack.processing, unit, '不滅', {
            source: { unit: stack.processing.id, effectCode: '黄金蝶の鱗粉' },
          });
        }
      });
  },

  onTurnEnd: async (stack: StackWithCard<Unit>) => {
    // 相手のターン終了時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      return;
    }

    await System.show(stack, '幻の黄金蝶', '手札に戻す');
    Effect.bounce(stack, stack.processing, stack.processing, 'hand');
  },
};
