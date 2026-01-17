import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■ネオ・サンダーボルト
  // あなたのユニットがフィールドに出た時、対戦相手の全ての行動済ユニットを消滅させる。
  // NOTE: インターセプトカードのチェッカーを実装
  checkDrive(stack: StackWithCard): boolean {
    const owner = stack.processing.owner;

    // 自分のユニットが召喚された時 かつ 相手の行動済みユニットがいる場合に発動
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === owner.id &&
      owner.opponent.field.some(unit => !unit.active)
    );
  },

  async onDrive(stack: StackWithCard) {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手の行動済みユニットをすべて取得
    const inactiveUnits = opponent.field.filter(unit => !unit.active);

    if (inactiveUnits.length > 0) {
      await System.show(stack, 'ネオ・サンダーボルト', '行動済ユニットを消滅');

      // すべての行動済ユニットを消滅
      for (const unit of inactiveUnits) {
        Effect.delete(stack, stack.processing, unit);
      }
    }
  },
};
