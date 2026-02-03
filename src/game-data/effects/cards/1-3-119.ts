import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

// カードがフィールドにあるかをカタログの name で判断するヘルパー関数
const hasFourGodCard = (stack: StackWithCard<Unit>, name: string): boolean => {
  return stack.processing.owner.field.some(unit => unit.catalog.name === name);
};

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、コスト4のユニットカードを1枚ランダムで手札に加える。
  // あなたのフィールドに［ブラック玄武］がいる場合、あなたはカードを1枚引き、コストを-2する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // ブラック玄武がいるかどうかをチェック
    const hasBlackGenbu = hasFourGodCard(stack, 'ブラック玄武');

    // デッキ内のコスト4であるユニット
    const cost4Units = stack.processing.owner.deck.filter(
      card => card.catalog.cost === 4 && card instanceof Unit
    );

    // 手札の空き枚数を計算する
    // ルールでの手札上限値 - 現在手札枚数 - （デッキにコスト4のユニットがあれば 1、無ければ 0）
    const countHandBlank =
      stack.core.room.rule.player.max.hand -
      stack.processing.owner.hand.length -
      (cost4Units.length > 0 ? 1 : 0);

    await EffectHelper.combine(stack, [
      // コスト4のユニットカードをランダムで1枚手札に加える
      {
        title: '四聖の共鳴',
        description: 'コスト4のユニットを引く',
        effect: () => {
          const [card] = EffectHelper.random(cost4Units, 1);
          if (card) Effect.move(stack, stack.processing, card, 'hand');
        },
      },
      // ブラック玄武がいる場合、カードを1枚引き、コストを-2する
      {
        title: '四聖の共鳴',
        description: 'カードを1枚引きコスト-2',
        effect: () => {
          const card = EffectTemplate.draw(stack.processing.owner, stack.core);
          if (card) {
            Effect.modifyCost(card, -2);
          }
        },
        condition: hasBlackGenbu && countHandBlank > 0,
      },
      {
        title: '翠檄叡智',
        description: '四聖獣ユニットに【不屈】を付与',
        effect: () => {
          //タイトル表示用
        },
      },
    ]);
  },

  // あなたの【四聖獣】ユニットに【不屈】を与える。（フィールド効果）
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // 自分の四聖獣ユニットを取得
    const fourGodUnits = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('四聖獣')
    );

    // 各四聖獣ユニットに【不屈】を付与（自身が付与したもののみを管理）
    for (const unit of fourGodUnits) {
      // このカードから既に付与された【不屈】があるか確認
      const fortitudeDelta = unit.delta.find(
        delta =>
          delta.source?.unit === stack.processing.id &&
          delta.source.effectCode === '不屈' &&
          delta.effect.type === 'keyword' &&
          delta.effect.name === '不屈'
      );

      // まだ付与されていない場合は付与する
      if (!fortitudeDelta) {
        Effect.keyword(stack, stack.processing, unit, '不屈', {
          source: { unit: stack.processing.id, effectCode: '不屈' },
        });
      }
    }
  },
};
