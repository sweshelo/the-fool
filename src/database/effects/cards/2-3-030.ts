import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkBattle: (stack: StackWithCard) => {
    // sourceとtargetが両方存在し、Unitであることを確認（生存チェック）
    if (
      stack.source &&
      stack.target &&
      stack.source instanceof Unit &&
      stack.target instanceof Unit
    ) {
      // sourceがフィールドに存在するか確認
      const sourceExists = stack.source.owner.field.some(unit => unit.id === stack.source?.id);
      // targetがフィールドに存在するか確認
      const targetExists = stack.target.owner.field.some(unit => unit.id === stack.target?.id);

      return sourceExists && targetExists;
    }
    return false;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onBattle: async (stack: StackWithCard): Promise<void> => {
    if (stack.source instanceof Unit && stack.target instanceof Unit) {
      const ownUnit =
        stack.source.owner.id === stack.processing.owner.id ? stack.source : stack.target;
      switch (stack.processing.lv) {
        case 1: {
          await System.show(stack, 'ドミノエフェクト', 'BP+3000');
          Effect.modifyBP(stack, stack.processing, ownUnit, 3000, { event: 'turnEnd', count: 1 });
          break;
        }
        case 2: {
          await System.show(stack, 'ドミノエフェクト', 'BP+6000\nカードを1枚引く');
          Effect.modifyBP(stack, stack.processing, ownUnit, 6000, { event: 'turnEnd', count: 1 });
          EffectTemplate.draw(stack.processing.owner, stack.core);
          break;
        }
        case 3: {
          await System.show(stack, 'ドミノエフェクト', 'BP+12000\nカードを1枚引く\nCP+1');
          Effect.modifyBP(stack, stack.processing, ownUnit, 12000, { event: 'turnEnd', count: 1 });
          EffectTemplate.draw(stack.processing.owner, stack.core);
          Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);
          break;
        }
      }
    } else {
      throw new Error('2-3-030: 対象が見つからない');
    }
  },
};
