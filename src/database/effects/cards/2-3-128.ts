import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '戦女神の誓い＆オルレアンの一撃',
      '【不屈】\n効果によるダメージを基本BPに+する\n基本BP+[ライフダメージ×1000]\n基本BP-[自身のBP]'
    );
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    const grow =
      (stack.core.room.rule.player.max.life - stack.processing.owner.life.current) * 1000;
    if (candidate_selectable) {
      const [unitId] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '基本BPを減少するユニットを選択'
      );
      if (unit)
        Effect.modifyBP(stack, stack.processing, unit, -stack.processing.bp - grow, {
          isBaseBP: true,
        });
    }
    Effect.modifyBP(
      stack,
      stack.processing,
      stack.processing,
      (stack.core.room.rule.player.max.life - stack.processing.owner.life.current) * 1000,
      { isBaseBP: true }
    );
    Effect.keyword(stack, stack.processing, stack.processing, '不屈');
  },

  onOverclockSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.opponent.field_selectable) {
      await System.show(stack, 'オルレアンの一撃', '敵全体の基本BP-3000\n【攻撃禁止】を与える');
      stack.processing.owner.opponent.field.forEach(unit => {
        Effect.modifyBP(stack, stack.processing, unit, -3000, { isBaseBP: true });
        Effect.keyword(stack, stack.processing, unit, '攻撃禁止');
      });
    }
  },
};
