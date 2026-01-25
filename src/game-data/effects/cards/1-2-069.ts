import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■弱肉強食
  // ユニットがフィールドに出た時、このカードのレベルによって以下の効果が発動する。
  // 【レベル1～2】全てのコスト1以下のユニットを破壊する。
  // 【レベル3】全てのコスト2以下のユニットを破壊する。
  checkDrive: (stack: StackWithCard): boolean => {
    // ユニットが出た時に発動
    if (!(stack.target instanceof Unit)) return false;

    const cardLv = stack.processing.lv;
    const costLimit = cardLv >= 3 ? 2 : 1;

    // 対象となるユニットが存在するかチェック
    const targets = stack.core.players.flatMap(player =>
      player.field.filter(unit => unit.catalog.cost <= costLimit)
    );

    return targets.length > 0;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const cardLv = stack.processing.lv;
    const costLimit = cardLv >= 3 ? 2 : 1;

    // 対象となるユニットを取得
    const targets = stack.core.players.flatMap(player =>
      player.field.filter(unit => unit.catalog.cost <= costLimit)
    );

    if (targets.length === 0) return;

    await System.show(stack, '弱肉強食', `コスト${costLimit}以下を全て破壊`);

    // 全てのコスト{costLimit}以下のユニットを破壊
    for (const target of targets) {
      Effect.break(stack, stack.processing, target);
    }
  },
};
