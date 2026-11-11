import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
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
      default:
        return EffectHelper.isBreakByEffect(stack);
    }
  },
  onBreak: async (stack: StackWithCard) => {
    // 型ガード
    if (stack.option?.type !== 'break' || !(stack.target instanceof Unit)) return;

    if (EffectHelper.isBreakByEffect(stack)) {
      await System.show(stack, '神の救済', '手札に戻す\nカードを1枚引く');
      Effect.bounce(stack, stack.processing, stack.processing, 'hand');
      EffectTemplate.draw(stack.processing.owner, stack.core);
    } else {
      await System.show(stack, '神の救済', '手札に戻す');
      Effect.bounce(stack, stack.processing, stack.processing, 'hand');
      Effect.bounce(stack, stack.processing, stack.target, 'hand');
    }
  },
};
