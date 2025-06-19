import { Color } from '@/submodule/suit/constant/color';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■おおきくなるよ！
  // あなたの赤属性ユニットがフィールドに出た時、ターン終了時までそれに【スピードムーブ】を与える。
  // NOTE: インターセプトカードのチェッカー実装
  checkDrive(stack: StackWithCard): boolean {
    // 自分の赤属性ユニットが召喚された時に発動
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.color === Color.RED
    );
  },

  async onDrive(stack: StackWithCard) {
    if (stack.target instanceof Unit) {
      await System.show(stack, 'おおきくなるよ！', '【スピードムーブ】を付与');
      Effect.speedMove(stack, stack.target);
    }
  },

  // あなたのユニットが戦闘した時、それがアタック中だった場合、ターン終了時までそれのBPを+2000する。
  // NOTE: アタック中であるかは、stack.target(アタッカー)が自ユニットであるかを検証
  checkBattle(stack: StackWithCard): boolean {
    // 自分のユニットがアタック中の戦闘である場合に発動
    return stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
  },

  async onBattle(stack: StackWithCard) {
    if (stack.target instanceof Unit) {
      await System.show(stack, 'おおきくなるよ！', 'BP+2000');
      Effect.modifyBP(stack, stack.processing, stack.target, 2000, {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
