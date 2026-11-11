import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant';

export const effects: CardEffects = {
  checkDrive: stack => {
    return (
      stack.processing.owner.id === stack.source.id &&
      stack.target instanceof Unit &&
      stack.target.catalog.color === Color.GREEN
    );
  },
  onDrive: async (stack: StackWithCard) => {
    const [choice] =
      (await EffectHelper.choice(stack, stack.processing.owner, '選略・荊の迷宮', [
        { id: '1', description: 'CP+2' },
        {
          id: '2',
          description: '基本BP+2000\nカードを1枚引く',
          condition: stack.processing.owner.field.some(unit => unit.id === stack.target?.id),
        },
      ])) ?? [];

    switch (choice) {
      case '1': {
        await System.show(stack, '荊の迷宮', 'CP+2');
        Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2);
        break;
      }
      case '2': {
        await System.show(stack, '荊の迷宮', '基本BP+2000\nカードを1枚引く');
        if (stack.target instanceof Unit)
          Effect.modifyBP(stack, stack.processing, stack.target, 2000, { isBaseBP: true });
        EffectTemplate.draw(stack.processing.owner, stack.core);
      }
    }
  },
};
