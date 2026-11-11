import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await EffectHelper.combine(stack, [
      {
        title: 'スピードムーブ',
        description: '行動制限の影響を受けない',
        effect: () => Effect.speedMove(stack, stack.processing),
      },
      {
        title: '貫通',
        description: 'ブロックを貫通してプレイヤーにダメージを与える',
        effect: () => Effect.keyword(stack, stack.processing, stack.processing, '貫通'),
      },
    ]);
  },
  onAttackSelf: async (stack: StackWithCard) => {
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) return;
    await System.show(stack, '巌流の決闘', '【強制防御】を付与\n行動権を回復');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '【強制防御】を付与し、行動権を回復するユニットを選択して下さい'
    );
    Effect.keyword(stack, stack.processing, target, '強制防御');
    Effect.activate(stack, stack.processing, target, true);
  },
  onBattleSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.source.id !== stack.processing.id || !(stack.target instanceof Unit)) return;
    await System.show(stack, '秘剣・燕返し', '基本BP-[自身のBP]');
    Effect.modifyBP(stack, stack.processing, stack.target, -stack.processing.currentBP, {
      isBaseBP: true,
    });
  },
};
