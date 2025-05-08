import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit)) return;
    await System.show(
      stack,
      '戦女神の誓い＆オルレアンの一撃',
      '【不屈】\n効果によるダメージを基本BPに+する\n基本BP+[ライフダメージ×1000]\n基本BP-[自身のBP]'
    );
    Effect.modifyBP(
      stack,
      stack.processing,
      stack.processing,
      (stack.core.room.rule.player.max.life - stack.processing.owner.life.current) * 1000,
      { isBaseBP: true }
    );

    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id
    );
    if (candidate.length > 0) {
      const [unitId] = await System.prompt(stack, stack.processing.owner.id, {
        type: 'unit',
        title: '基本BPを減少するユニットを選択',
        items: candidate,
      });
      const unit = candidate.find(unit => unit.id === unitId);
      if (unit)
        Effect.modifyBP(stack, stack.processing, unit, -stack.processing.bp, { isBaseBP: true });
      Effect.keyword(stack, stack.processing, stack.processing, '不屈');
    }
  },

  onOverclockSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.opponent.field.length > 0) {
      await System.show(stack, 'オルレアンの一撃', '敵全体の基本BP-3000\n【攻撃禁止】を与える');
      stack.processing.owner.opponent.field.forEach(unit => {
        Effect.modifyBP(stack, stack.processing, unit, -3000, { isBaseBP: true });
        Effect.keyword(stack, stack.processing, unit, '攻撃禁止');
      });
    }
  },
};
