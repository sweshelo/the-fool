import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Effect } from '../engine/effect';
import { Unit } from '@/package/core/class/card';
import { EffectHelper } from '../engine/helper';

const effect = async (stack: StackWithCard<Unit>) => {
  stack.core.players
    .flatMap(player => player.field)
    .forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, 2000, { event: 'turnEnd', count: 1 });
    });
  if (stack.processing.owner.id !== stack.core.getTurnPlayer().id)
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
};

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'インターセプトドロー', 'インターセプトカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },

  onBreak: async (stack: StackWithCard<Unit>) => {
    if (
      stack.target instanceof Unit &&
      stack.target.id !== stack.processing.id &&
      stack.target.owner.id === stack.processing.owner.id
    ) {
      const isOwnTurn = stack.processing.owner.id === stack.core.getTurnPlayer().id;
      await System.show(stack, '禍々しき厄災', isOwnTurn ? 'BP+2000' : 'BP+2000\nCP+1');
      await effect(stack);
    }
  },

  onBreakSelf: async (stack: StackWithCard<Unit>) => {
    const isOwnTurn = stack.processing.owner.id === stack.core.getTurnPlayer().id;
    await EffectHelper.combine(stack, [
      {
        title: '選ばれし殉葬',
        description: 'ユニットを1体破壊',
        effect: async () => {
          const [target] = await EffectHelper.pickUnit(
            stack,
            stack.processing.owner,
            'opponents',
            '破壊するユニットを選択して下さい'
          );
          Effect.break(stack, stack.processing, target, 'effect');
        },
        condition: EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner),
      },
      {
        title: '禍々しき厄災',
        description: 'BP+2000',
        effect: async () => effect(stack),
      },
      {
        title: '禍々しき厄災',
        description: 'CP+1',
        effect: () => {},
        condition: !isOwnTurn,
      },
    ]);
  },
};
