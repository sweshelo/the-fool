import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // ■援軍／獣
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '援軍／獣＆リトルキャットソウル', '【獣】ユニットを1枚引く\nBP+4000');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '獣' });
  },

  // ■リトルキャットソウル
  // あなたのフィールドに【獣】ユニットが3体以上いる時、このユニットのBPを+4000する
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    const beastCount = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('獣')
    ).length;

    // 既にこのユニットが発行したDeltaが存在するか確認する
    const delta = stack.processing.delta.find(
      delta => delta.source?.unit === stack.processing.id && delta.effect.type === 'bp'
    );

    if (beastCount >= 3) {
      if (delta && delta.effect.type === 'bp') {
        // Deltaを編集する
        delta.effect.diff = 4000;
      } else {
        // 新規Deltaを生成
        Effect.modifyBP(stack, stack.processing, stack.processing, 4000, {
          source: { unit: stack.processing.id },
        });
      }
    } else {
      // 条件を満たしていない場合は既存のDeltaを削除
      if (delta) {
        stack.processing.delta = stack.processing.delta.filter(d => d !== delta);
      }
    }
  },
};
