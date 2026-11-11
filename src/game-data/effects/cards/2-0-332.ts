import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';
import { Player } from '@/package/core/class/Player';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '貫通', 'ブロックを貫通してプレイヤーにダメージを与える');
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
  },
  onOverclockSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.opponent.field.length === 0 || !stack.processing.owner.purple)
      return;
    await System.show(stack, 'オーラソード', '敵全体の基本BP-[紫ゲージ×1000]');
    stack.processing.owner.opponent.field.forEach(unit =>
      Effect.modifyBP(stack, stack.processing, unit, (stack.processing.owner.purple ?? 0) * -1000, {
        isBaseBP: true,
      })
    );
  },
  onModifyPurple: async (stack: StackWithCard<Unit>) => {
    if (
      stack.option?.type !== 'purple' ||
      stack.option.value >= 0 ||
      !(stack.target instanceof Player) ||
      stack.target.id !== stack.processing.owner.id
    )
      return;
    await System.show(stack, '不倒の勇士', '行動権を回復');
    Effect.activate(stack, stack.processing, stack.processing, true);
  },
};
