import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onAttackSelf: async (stack: StackWithCard) => {
    const damage =
      stack.processing.owner.trash.filter(card => card.catalog.species?.includes('侍')).length *
      1500;
    if (
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner) &&
      damage > 0
    ) {
      await System.show(stack, '奥義・八艘飛刃', '[捨札の【侍】×1500]ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択して下さい'
      );
      Effect.damage(stack, stack.processing, target, damage);
    }
  },

  onPlayerAttackSelf: async (stack: StackWithCard) => {
    await System.show(stack, '千秋の想い', '【舞姫】を1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '舞姫' });
  },
};
