import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■夢破れし者
  // 対戦相手のユニットがフィールドに出た時、対戦相手の全てのユニットに【進化禁止】（進化することができない）を与える。あなたはインターセプトカードを1枚引く。
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    // 対戦相手のユニットが召喚された時のみ発動
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.opponent.id &&
      stack.processing.owner.opponent.field.length > 0
    );
  },

  onDrive: async (stack: StackWithCard<Card>): Promise<void> => {
    // 対戦相手のフィールド上の全てのユニット
    const opponentUnits = stack.processing.owner.opponent.field;

    await System.show(stack, '夢破れし者', '【進化禁止】を付与\nインターセプトを引く');

    // 全てのユニットに【進化禁止】を付与
    for (const unit of opponentUnits) {
      Effect.keyword(stack, stack.processing, unit, '進化禁止', {
        source: { unit: stack.processing.id },
      });
    }

    // インターセプトカードを1枚引く
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },
};
