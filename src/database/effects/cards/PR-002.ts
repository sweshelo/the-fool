import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、対戦相手のフィールドにいるユニットの属性に応じて以下の効果が発動する。
  // 赤属性：自身に【秩序の盾】を与える。
  // 黄属性：自身に【消滅効果耐性】を与える。
  // 青属性：自身に【破壊効果耐性】を与える。
  // 緑属性：自身の基本BPを+2000する。
  // 紫属性：対戦相手の紫ゲージを-1する。
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 相手のフィールドのユニットを取得
    const opponentUnits = opponent.field;
    if (opponentUnits.length === 0) return;

    // 各属性のユニットをカウント
    const attributeCounts = {
      red: opponentUnits.filter(unit => unit.catalog.color === Color.RED).length,
      yellow: opponentUnits.filter(unit => unit.catalog.color === Color.YELLOW).length,
      blue: opponentUnits.filter(unit => unit.catalog.color === Color.BLUE).length,
      green: opponentUnits.filter(unit => unit.catalog.color === Color.GREEN).length,
      purple: opponentUnits.filter(unit => unit.catalog.color === Color.PURPLE).length,
    };

    // 効果を発動
    const isOnRedUnit = attributeCounts.red > 0;
    const isOnYellowUnit = attributeCounts.yellow > 0;
    const isOnBlueUnit = attributeCounts.blue > 0;
    const isOnGreenUnit = attributeCounts.green > 0;
    const isOnPurpleUnit = attributeCounts.purple > 0;

    const effects = [
      opponentUnits ? '【秩序の盾】を得る' : null,
      isOnYellowUnit ? '【消滅効果耐性】を得る' : null,
      isOnBlueUnit ? '【破壊効果耐性】を得る' : null,
      isOnGreenUnit ? '基本BP+2000' : null,
      isOnPurpleUnit ? '紫ゲージ-1' : null,
    ].filter(Boolean);

    await System.show(stack, 'エレメントパワー', effects.join('\n'));

    if (isOnRedUnit) {
      Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
    }

    if (isOnYellowUnit) {
      Effect.keyword(stack, stack.processing, stack.processing, '消滅効果耐性');
    }

    if (isOnBlueUnit) {
      Effect.keyword(stack, stack.processing, stack.processing, '破壊効果耐性');
    }

    if (isOnGreenUnit) {
      Effect.modifyBP(stack, stack.processing, stack.processing, 2000, { isBaseBP: true });
    }

    if (isOnPurpleUnit) {
      Effect.modifyPurple(stack, stack.processing, opponent, -1);
    }
  },
};
