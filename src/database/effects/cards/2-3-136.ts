import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');
    Effect.speedMove(stack, stack.processing);
  },

  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );
    if (candidates.length === 0 || stack.processing.owner.joker < 20) return;
    await System.show(stack, 'Heart Heat Beat', 'ジョーカーゲージを20%減少\n手札に戻す');
    stack.processing.owner.joker -= 20;
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      candidates,
      '手札に戻すユニットを選択してください',
      1
    );
    Effect.move(stack, stack.processing, target, 'hand');
  },

  onTurnStart: async (stack: StackWithCard<Unit>) => {
    if (
      (stack.processing.owner.purple ?? 0) >= 3 &&
      stack.processing.owner.id !== stack.core.getTurnPlayer().id
    ) {
      await System.show(stack, 'feat.PURPLE', '行動圏を回復');
      Effect.activate(stack, stack.processing, stack.processing, true);
    }
  },

  onBreakSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.field.length < stack.core.room.rule.player.max.field) {
      await System.show(stack, 'Next stage', '[奈落大帝タルタロス]を 【特殊召喚】\n行動権を消費');

      const card = new Unit(stack.processing.owner, '2-3-136');
      await Effect.summon(stack, stack.processing, card);
      Effect.activate(stack, stack.processing, card, false);
    }
  },
};
