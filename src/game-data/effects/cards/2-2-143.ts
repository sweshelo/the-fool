import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkBreak: (stack: StackWithCard) => {
    // あなたのユニットが破壊された時
    return stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
  },

  // １：あなたはインターセプトカードを1枚引く
  // ２：コスト2以下のユニットを【特殊召喚】する
  onBreak: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const choice = await EffectHelper.choice(stack, owner, '選略・氷獄の麗人', [
      { id: '1', description: 'インターセプトを1枚引く' },
      {
        id: '2',
        description: 'コスト2以下を【特殊召喚】',
        condition: () => owner.field.length < stack.core.room.rule.player.max.field,
      },
    ]);

    switch (choice) {
      case '1':
      default:
        await System.show(stack, '選略・氷獄の麗人', 'インターセプトを1枚引く');
        EffectTemplate.reinforcements(stack, owner, { type: ['intercept'] });
        break;
      case '2': {
        await System.show(stack, '選略・氷獄の麗人', 'コスト2以下を【特殊召喚】');
        const [target] = EffectHelper.random(
          owner.trash.filter(unit => unit.catalog.type === 'unit' && unit.catalog.cost <= 2)
        );
        if (target instanceof Unit) {
          await Effect.summon(stack, stack.processing, target);
        }
        break;
      }
    }
  },
};
