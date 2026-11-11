import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkBreak: stack => {
    if (
      stack.option?.type !== 'break' ||
      !(stack.target instanceof Unit) ||
      stack.core.getTurnPlayer().id === stack.processing.owner.id ||
      !stack.processing.owner.field.some(unit => unit.id === stack.target?.id)
    )
      return false;
    switch (stack.option.cause) {
      case 'battle':
        return stack.target.catalog.cost >= 2;
      case 'effect':
        return true;
      default:
        return false;
    }
  },
  onBreak: async (stack: StackWithCard) => {
    // 型ガード
    if (stack.option?.type !== 'break' || !(stack.target instanceof Unit)) return;

    switch (stack.option.cause) {
      case 'battle': {
        await System.show(stack, '神の救済', '手札に戻す');
        Effect.bounce(stack, stack.processing, stack.processing, 'hand');
        Effect.bounce(stack, stack.processing, stack.target, 'hand');
        break;
      }

      case 'effect': {
        await System.show(stack, '神の救済', '手札に戻す\nカードを1枚引く');
        Effect.bounce(stack, stack.processing, stack.processing, 'hand');
        EffectTemplate.draw(stack.processing.owner, stack.core);
      }
    }
  },
};
