import { Card, Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // インターセプトカードのチェック関数
  // 戦闘時に発動するインターセプトなので、checkBattleメソッドを実装
  checkBattle: (stack: StackWithCard<Card>): boolean => {
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

  // あなたのユニットが戦闘した時、それの基本BPを+2000し、戦闘中の相手ユニットの基本BPを-2000する。
  onBattle: async (stack: StackWithCard<Unit>): Promise<void> => {
    // stack.sourceとstack.targetが存在し、両方Unitであることを確認
    if (stack.source instanceof Unit && stack.target instanceof Unit) {
      await System.show(stack, 'エナジードレイン', '基本BP+2000\n基本BP-2000');
      const ownUnit =
        stack.processing.owner.id === stack.source.owner.id ? stack.source : stack.target;
      const opponentUnit =
        stack.processing.owner.id === stack.source.owner.id ? stack.target : stack.source;

      // 自ユニットのBPを+2000
      Effect.modifyBP(stack, stack.processing, ownUnit, +2000, { isBaseBP: true });

      // 相手ユニットのBPを-2000
      Effect.modifyBP(stack, stack.processing, opponentUnit, -2000, { isBaseBP: true });
    }
  },
};
