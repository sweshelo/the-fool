import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { KeywordEffect } from '@/submodule/suit/types';

export const effects: CardEffects = {
  // 召喚時に【神託】を付与し、相手ユニットを1体選んで手札に作成
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const opponent = stack.processing.owner.opponent;
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === opponent.id,
      stack.processing.owner
    );

    if (candidates.length > 0) {
      // 効果テキストをまとめて表示
      await System.show(stack, '包み込む白翼', '【神託】を付与\n手札に作成');
      // 相手ユニットを1体選んで手札に作成
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidates,
        '手札に作成するユニットを選んでください',
        1
      );
      if (!target || stack.processing.owner.hand.length >= stack.core.room.rule.player.max.hand)
        return;
      const clonedCard = target.clone(stack.processing.owner);
      stack.processing.owner.hand.push(clonedCard);
    } else {
      await System.show(stack, '神託', '奇跡を発動すると【神託】は取り除かれる');
    }

    Effect.keyword(stack, stack.processing, stack.processing, '神託');
  },
  // 相手ユニットがフィールドに出た時、【神託】がある場合に【呪縛】を与え【神託】を除去
  onDrive: async (stack: StackWithCard<Unit>) => {
    if (!stack.processing.hasKeyword('神託')) return;
    if (!(stack.target instanceof Unit)) return;
    if (stack.target.owner.id === stack.processing.owner.id) return;
    await System.show(stack, '奇跡・光輝なる天罰', '【呪縛】を付与\n【神託】を除去');
    Effect.keyword(stack, stack.processing, stack.target, '呪縛' as KeywordEffect);
    Effect.removeKeyword(stack, stack.processing, '神託' as KeywordEffect);
  },
};
