import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');
    Effect.speedMove(stack, stack.processing);
  },
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.opponent.field.length === 0) return;
    await System.show(stack, '憤怒の爆炎弾', '敵全体に【オーバーヒート】を与える');
    stack.processing.owner.opponent.field.forEach(unit =>
      Effect.keyword(stack, stack.processing, unit, 'オーバーヒート')
    );
  },
  isBootable: () => true, // 自分自身のダメージ対象のため、常に有効
  onBootSelf: async (stack: StackWithCard) => {
    await System.show(stack, '起動・転生の邪炎', '全ユニットに3000ダメージ');
    [...stack.processing.owner.field, ...stack.processing.owner.opponent.field].forEach(unit =>
      Effect.damage(stack, stack.processing, unit, 3000)
    );
  },
};
