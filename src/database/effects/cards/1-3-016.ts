import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { EffectTemplate } from '../classes/templates';

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
  // あなたのフィールドに［ブラック白虎］がいる場合、【四聖獣】ユニットを1枚引く。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // ブラック白虎がいるかどうかをチェック
    const hasBlackByakko = hasFourGodCard(stack, 'ブラック白虎');

    // ブラック白虎がいる場合、【四聖獣】ユニットを1枚引く
    if (hasBlackByakko) {
      await System.show(
        stack,
        '四聖の共鳴',
        'コスト4のユニットを引く\n【四聖獣】ユニットを1枚引く'
      );
      // 四聖獣ユニットを引く（EffectTemplateのreinforcementsを使用）
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '四聖獣' });
    } else {
      await System.show(stack, '四聖の共鳴', 'コスト4のユニットを引く');
    }

    // コスト4のユニットカードをランダムで1枚手札に加える
    const [card] = EffectHelper.random(
      stack.processing.owner.deck.filter(card => card.catalog.cost === 4 && card instanceof Unit),
      1
    );
    if (card) Effect.move(stack, stack.processing, card, 'hand');
  },

  // このユニットがブロックした時、ターン終了時までこのユニットのBPを+［あなたのフィールドにいる【四聖獣】ユニット×2000］する。
  onBlockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // フィールド上の【四聖獣】ユニット数を数える
    const fourGodCount = countFourGodUnits(stack);

    if (fourGodCount > 0) {
      const bpBoost = fourGodCount * 2000;
      await System.show(stack, '白撃武爪', `BP+${bpBoost}`);

      // ターン終了時までBPを増加
      Effect.modifyBP(stack, stack.processing, stack.processing, bpBoost, {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
