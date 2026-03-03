import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkBattle: (stack: StackWithCard) =>
    [stack.source, stack.target].some(object =>
      stack.processing.owner.field.some(unit => unit.id === object?.id)
    ),
  onBattle: async (stack: StackWithCard) => {
    await System.show(
      stack,
      'オーバードーズ',
      'ターン終了時までBP+[紫ゲージ×4000]\n基本BP-[紫ゲージ×2000]'
    );

    // 戦闘中の自ユニットを特定
    const ownUnit = [stack.source, stack.target].find(
      (object): object is Unit =>
        object instanceof Unit && object.owner.id === stack.processing.owner.id
    );

    if (ownUnit) {
      Effect.modifyBP(
        stack,
        stack.processing,
        ownUnit,
        (stack.processing.owner.purple ?? 0) * 4000,
        { event: 'turnEnd', count: 1 }
      );
      Effect.modifyBP(
        stack,
        stack.processing,
        ownUnit,
        (stack.processing.owner.purple ?? 0) * -2000,
        { isBaseBP: true }
      );
    }
  },
};
