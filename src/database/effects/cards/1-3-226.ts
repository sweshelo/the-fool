import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ドロー', 'カードを1枚引く');
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    if (
      stack.processing.owner.id !== stack.core.getTurnPlayer().id &&
      stack.processing.owner.cp.current >= 1 &&
      stack.processing.owner.field.length < stack.core.room.rule.player.max.field
    ) {
      await System.show(stack, '建国の礎', '[フォースフラワー]を【特殊召喚】');
      const unit = new Unit(stack.processing.owner, '1-3-226');
      Effect.summon(stack, stack.processing, unit);
    }

    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await System.show(stack, '聖魂発生装置', 'CP+1');
      Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
    }
  },
};
