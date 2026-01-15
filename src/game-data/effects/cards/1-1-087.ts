import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(
      stack,
      '五輪書',
      '味方全体のBP+1000\n【侍】に【不屈】【貫通】【スピードムーブ】【無我の境地】【固着】を付与'
    );
  },

  onPlayerAttackSelf: async (stack: StackWithCard) => {
    await System.show(stack, '二天流', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },

  fieldEffect: (stack: StackWithCard) => {
    // BPアップ効果
    stack.processing.owner.field.forEach(unit => {
      if (
        !unit.delta.some(
          delta =>
            delta.source?.unit === stack.processing.id && delta.source.effectCode === '五輪書_BP'
        )
      ) {
        Effect.modifyBP(stack, stack.processing, unit, 1000, {
          source: { unit: stack.processing.id, effectCode: '五輪書_BP' },
        });
      }
    });

    // 自フィールドの侍をカウント
    const ownSamurai = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('侍')
    );
    const hasMoreThanTwoSamurai = ownSamurai.length >= 2;

    if (hasMoreThanTwoSamurai) {
      // キーワード能力を付与
      ownSamurai.forEach(unit => {
        if (
          !unit.delta.some(
            delta =>
              delta.source?.unit === stack.processing.id && delta.source.effectCode === '五輪書'
          )
        ) {
          Effect.keyword(stack, stack.processing, unit, '不屈', {
            source: { unit: stack.processing.id, effectCode: '五輪書' },
          });
          Effect.keyword(stack, stack.processing, unit, '貫通', {
            source: { unit: stack.processing.id, effectCode: '五輪書' },
          });
          Effect.keyword(stack, stack.processing, unit, '無我の境地', {
            source: { unit: stack.processing.id, effectCode: '五輪書' },
          });
          Effect.keyword(stack, stack.processing, unit, '固着', {
            source: { unit: stack.processing.id, effectCode: '五輪書' },
          });
          Effect.speedMove(stack, unit);
        }
      });
    } else {
      // キーワード能力を剥奪
      ownSamurai.forEach(unit => {
        if (unit.delta.some(delta => delta.source?.unit === stack.processing.id)) {
          Effect.removeKeyword(stack, unit, '不屈', {
            source: { unit: stack.processing.id, effectCode: '五輪書' },
          });
          Effect.removeKeyword(stack, unit, '貫通', {
            source: { unit: stack.processing.id, effectCode: '五輪書' },
          });
          Effect.removeKeyword(stack, unit, '無我の境地', {
            source: { unit: stack.processing.id, effectCode: '五輪書' },
          });
          Effect.removeKeyword(stack, unit, '固着', {
            source: { unit: stack.processing.id, effectCode: '五輪書' },
          });
        }
      });
    }
  },
};
