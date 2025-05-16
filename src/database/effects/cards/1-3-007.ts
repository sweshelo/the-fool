import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

// カードがフィールドにあるかをカタログの name で判断するヘルパー関数
const hasFourGodCard = (stack: StackWithCard<Unit>, name: string): boolean => {
  return stack.processing.owner.field.some(unit => unit.catalog.name === name);
};

// フィールド上の【四聖獣】ユニット数を数える
const countFourGodUnits = (stack: StackWithCard<Unit>): number => {
  return stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('四聖獣'))
    .length;
};

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、コスト4のユニットカードを1枚ランダムで手札に加える。
  // あなたのフィールドに［ブラック朱雀］がいる場合、このユニットに【スピードムーブ】を与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // ブラック朱雀がいるかどうかをチェック
    const hasBlackSuzaku = hasFourGodCard(stack, 'ブラック朱雀');

    // ブラック朱雀がいる場合、【スピードムーブ】を付与
    if (hasBlackSuzaku) {
      await System.show(stack, '四聖の共鳴', 'コスト4のユニットを引く\n【スピードムーブ】を得る');
      Effect.speedMove(stack, stack.processing);
    } else {
      await System.show(stack, '四聖の共鳴', 'コスト4のユニットを引く');
    }

    // コスト4のユニットカードをランダムで1枚手札に加える
    const cost4Units = stack.processing.owner.deck.filter(
      card => card instanceof Unit && card.catalog.cost === 4
    );

    if (cost4Units.length > 0) {
      // ランダムに1枚選択
      const randomIndex = Math.floor(Math.random() * cost4Units.length);
      const randomUnit = cost4Units[randomIndex];
      // randomUnitが確実に存在することを確認
      if (randomUnit) {
        Effect.move(stack, stack.processing, randomUnit, 'hand');
      }
    }
  },

  // このユニットがアタックした時、ターン終了時までこのユニットのBPを+［あなたのフィールドにいる【四聖獣】ユニット×2000］する。
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // フィールド上の【四聖獣】ユニット数を数える
    const fourGodCount = countFourGodUnits(stack);

    if (fourGodCount > 0) {
      const bpBoost = fourGodCount * 2000;
      await System.show(stack, '紅翼天翔', `BP+${bpBoost}`);

      // ターン終了時までBPを増加
      Effect.modifyBP(stack, stack.processing, stack.processing, bpBoost, {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
