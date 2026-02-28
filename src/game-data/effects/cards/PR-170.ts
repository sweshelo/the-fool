import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'ダークチャージ', '紫ゲージ+1');
  },
  onModifyPurple: async (stack: StackWithCard) => {
    if (
      stack.target?.id !== stack.processing.owner.id ||
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    )
      return;
    await System.show(stack, '怪火の機術', '2000ダメージ');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      'ダメージを与えるユニットを選択'
    );
    Effect.damage(stack, stack.processing, target, 2000);
  },
};
