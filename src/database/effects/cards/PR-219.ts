import type { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';
import { EffectHelper } from '../classes/helper';

export const effects: CardEffects = {
  onTurnEndInTrash: async (stack: StackWithCard<Unit>) => {
    if (
      stack.processing.owner.id !== stack.source.id &&
      stack.processing.owner.trash.filter(card => card.catalog.species?.includes('忍者')).length >=
        7 &&
      stack.processing.owner.field.length < stack.core.room.rule.player.max.field
    ) {
      // oxlint-disable-next-line no-floating-promises
      Effect.summon(stack, stack.processing, stack.processing);
      await System.show(stack, '亡骸の目覚め', '【特殊召喚】');
    }
  },

  onPlayerAttackSelf: async (stack: StackWithCard<Unit>) => {
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, '闇忍法・落命の術', 'デスカウンター[1]を付与\n自身を消滅');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'デスカウンターを与えるユニットを選択して下さい'
      );
      Effect.death(stack, stack.processing, target, 1);
    } else {
      await System.show(stack, '闇忍法・落命の術', '自身を消滅');
    }
    Effect.delete(stack, stack.processing, stack.processing);
  },
};
