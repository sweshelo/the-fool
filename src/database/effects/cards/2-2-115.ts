import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // ■呑舟の大海嘯
  // このユニットがフィールドに出た時、対戦相手のレベル2以上のユニットを全て破壊する。対戦相手のレベル1のユニットのレベルを+1する。
  // あなたの捨札に青属性カードが10枚以上ある場合、このユニットに【スピードムーブ】を与える。
  // このユニットが戦闘した時、それがアタック中だった場合、戦闘中の相手ユニットを破壊する。
  // このユニットがプレイヤーアタックに成功した時、対戦相手の全てのユニットに【沈黙】とデスカウンター［1］を与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    const opponentUnits = opponent.field;

    // レベル2以上のユニットとレベル1のユニットを分ける
    const lvTwoOrHigherUnits = opponentUnits.filter(unit => unit.lv >= 2);
    const lvOneUnits = opponentUnits.filter(unit => unit.lv === 1);

    // 捨札の青属性カードをチェック
    const blueCardsInTrash = stack.processing.owner.trash.filter(
      card => card.catalog.color === Color.BLUE
    );

    // 効果テキストを組み立て（相手のフィールドにユニットがいない場合、スピードムーブのみ表示）
    let effectText = '';
    if (opponentUnits.length > 0) {
      effectText = '敵Lv2以上のユニットを全て破壊\n敵Lv1のユニットのレベル+1';
    }
    if (blueCardsInTrash.length >= 10) {
      effectText += (effectText ? '\n' : '') + '【スピードムーブ】を得る';
    }

    if (effectText) {
      await System.show(stack, '呑舟の大海嘯', effectText);

      // レベル2以上のユニットを破壊
      lvTwoOrHigherUnits.forEach(unit => {
        Effect.break(stack, stack.processing, unit);
      });

      // レベル1のユニットのレベルを+1
      lvOneUnits.forEach(unit => {
        Effect.clock(stack, stack.processing, unit, 1);
      });

      // 条件を満たせば【スピードムーブ】を与える
      if (blueCardsInTrash.length >= 10) {
        Effect.speedMove(stack, stack.processing);
      }
    }
  },

  // 戦闘時の効果
  onBattle: async (stack: StackWithCard<Unit>): Promise<void> => {
    // このユニットがアタック中かチェック
    if (stack.target && stack.source.id === stack.processing.id) {
      // 戦闘中の相手ユニットを特定
      const opponent = stack.target;

      if (opponent instanceof Unit) {
        await System.show(stack, '呑舟の大海嘯', '戦闘中の相手ユニットを破壊');

        // 相手ユニットを破壊
        Effect.break(stack, stack.processing, opponent);
      }
    }
  },

  // プレイヤーアタック成功時の効果
  onPlayerAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    const attacker = stack.source as Unit;
    // このユニットがプレイヤーアタックに成功した時のみ処理
    if (attacker.id !== stack.processing.id) return;

    const opponent = stack.processing.owner.opponent;
    const opponentUnits = opponent.field;

    if (opponentUnits.length > 0) {
      await System.show(stack, '呑舟の大海嘯', '敵全体に【沈黙】とデスカウンター［1］');

      // 全てのユニットに【沈黙】とデスカウンター[1]を与える
      opponentUnits.forEach(unit => {
        Effect.keyword(stack, stack.processing, unit, '沈黙');
        Effect.death(stack, stack.processing, unit, 1);
      });
    }
  },
};
