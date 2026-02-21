import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkDrive: () => true,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'クローン生成', '同じユニットを引く');
    const drivenUnit = stack.target;
    if (!(drivenUnit instanceof Unit)) return;

    // 同名でIDが異なるカードが存在するため、IDベースではなくnameベースでカタログ検索する
    const [target] = EffectHelper.random(
      stack.processing.owner.deck.filter(card => card.catalog.name === drivenUnit.catalog.name)
    );
    if (target) Effect.move(stack, stack.processing, target, 'hand');
  },
};
