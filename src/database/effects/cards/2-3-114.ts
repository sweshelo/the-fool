import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id && !unit.active,
      stack.processing.owner
    );
    const life = stack.processing.owner.life.current;

    if (candidate.length > 0) {
      await System.show(
        stack,
        'ロード・トゥ・ヴァルハラ',
        `ユニットを【複製】する${life <= 6 ? '\n手札に作成する' : ''}${life <= 4 ? '\n消滅させる' : ''}`
      );
      const choices: Choices = {
        title: '対象のユニットを選択してください',
        type: 'unit',
        items: candidate,
      };

      const [unitId] = await System.prompt(stack, stack.processing.owner.id, choices);
      const unit = candidate.find(card => card.id === unitId);
      if (!(unit instanceof Unit)) throw new Error('ユニットでないオブジェクトが選択されました');

      if (life <= 8) await Effect.clone(stack, stack.processing, unit, stack.processing.owner);
      if (life <= 6 && stack.processing.owner.hand.length < stack.core.room.rule.player.max.hand)
        stack.processing.owner.hand.push(unit.clone(stack.processing.owner, false));
      if (life <= 4) Effect.delete(stack, stack.processing, unit);
    }

    await System.show(stack, '悦び', 'BP+[ライフダメージ×1000]');
  },

  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // BP増加量を計算
    const bpBoost = stack.processing.owner.life.max - stack.processing.owner.life.current;

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
