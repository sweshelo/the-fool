import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ユニットがフィールドに出た時: 対戦相手ユニットが存在するかチェック
  checkDrive: (stack: StackWithCard): boolean => {
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    return EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner);
  },

  // 紫ゲージに応じてダメージ回数を変更
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const purple = stack.processing.owner.purple ?? 0;
    const repeatCount = purple <= 2 ? 3 : 7;
    const message = purple <= 2 ? '1000ダメージ×3' : '1000ダメージ×7';

    await System.show(stack, 'ホーミングバレット', message);

    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;

    EffectHelper.repeat(repeatCount, () => {
      const selectableUnits = stack.core.players.flatMap(player => player.field).filter(filter);
      if (selectableUnits.length > 0) {
        const [target] = EffectHelper.random(selectableUnits);
        if (target) Effect.damage(stack, stack.processing, target, 1000, 'effect');
      }
    });
  },
};
