import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.target instanceof Unit &&
    stack.target.owner.id === stack.processing.owner.id &&
    stack.target.catalog.type === 'advanced_unit' &&
    stack.target.catalog.cost >= 4 &&
    stack.target.catalog.color === Color.BLUE,
  onDrive: async (stack: StackWithCard) => {
    const filter = (unit: Unit) =>
      unit.owner.id !== stack.processing.owner.id && unit.catalog.cost <= 2;
    const [choice] =
      (await EffectHelper.choice(stack, stack.processing.owner, '選略・イービルアイズ', [
        { id: '1', description: 'デッキから青属性のカードを2枚セット' },
        {
          id: '2',
          description: '対戦相手のコスト2以下を破壊',
          condition: EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner),
        },
      ])) ?? [];

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・イービルアイズ', 'デッキから青属性のカードを2枚セット');
        EffectHelper.random(
          stack.processing.owner.deck.filter(card => card.catalog.color === Color.BLUE),
          Math.min(
            2,
            stack.core.room.rule.player.max.trigger - stack.processing.owner.trigger.length
          )
        ).forEach(card => Effect.move(stack, stack.processing, card, 'trigger'));
        break;
      }
      case '2': {
        await System.show(stack, '選略・イービルアイズ', '対戦相手のコスト2以下を破壊');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          '破壊するユニットを選択して下さい'
        );
        Effect.break(stack, stack.processing, target, 'effect');
        break;
      }
    }
  },
};
