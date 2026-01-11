import { System } from '../classes/system';
import { EffectTemplate } from '../classes/templates';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Effect } from '../classes/effect';
import { Unit } from '@/package/core/class/card';
import { EffectHelper } from '../classes/helper';

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
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(
        stack,
        '選ばれし殉葬',
        isOwnTurn ? 'BP+2000\nユニットを1体破壊' : 'BP+2000\nCP+1\nユニットを1体破壊'
      );
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        '破壊するユニットを選択して下さい'
      );
      Effect.break(stack, stack.processing, target, 'effect');
    } else {
      await System.show(stack, '禍々しき厄災', isOwnTurn ? 'BP+2000' : 'BP+2000\nCP+1');
    }
    await effect(stack);
  },
};
