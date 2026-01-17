import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id && !unit.active;
    const life = stack.processing.owner.life.current;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(
        stack,
        'ロード・トゥ・ヴァルハラ',
        `ユニットを【複製】する${life <= 6 ? '\n手札に作成する' : ''}${life <= 4 ? '\n消滅させる' : ''}`
      );

      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '対象のユニットを選択してください'
      );
      if (life <= 8) await Effect.clone(stack, stack.processing, target, stack.processing.owner);
      if (life <= 6) Effect.make(stack, stack.processing.owner, target);
      if (life <= 4) Effect.delete(stack, stack.processing, target);
    }

    await System.show(stack, '悦び', 'BP+[ライフダメージ×1000]');
  },

  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // BP増加量を計算
    const bpBoost = (stack.processing.owner.life.max - stack.processing.owner.life.current) * 1000;

    // 既にこのユニットが発行したDeltaが存在するか確認
    const delta = stack.processing.delta.find(
      d => d.source?.unit === stack.processing.id && d.source?.effectCode === '悦び'
    );

    if (delta && delta.effect.type === 'bp') {
      // Deltaを編集する
      delta.effect.diff = bpBoost;
    } else {
      // 新しいDeltaを追加
      Effect.modifyBP(stack, stack.processing, stack.processing, bpBoost, {
        source: { unit: stack.processing.id, effectCode: '悦び' },
      });
    }
  },
};
