import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時、全てのレベル1以下のユニットに5000ダメージを与える。
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    if (!(stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id)) {
      return false;
    }

    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // レベル1以下のユニットが存在するかチェック
    const hasTargets = [...owner.field, ...opponent.field].some(unit => unit.lv <= 1);

    return hasTargets;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 両プレイヤーのレベル1以下のユニット
    const allTargets = [...owner.field, ...opponent.field].filter(unit => unit.lv <= 1);

    await System.show(stack, 'チェインフレイム', 'レベル1以下に5000ダメージ');
    allTargets.forEach(unit => Effect.damage(stack, stack.processing, unit, 5000));
  },
};
