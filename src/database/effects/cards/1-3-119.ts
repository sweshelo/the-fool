import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Delta } from '@/package/core/class/delta';

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

    // ブラック玄武がいる場合、カードを1枚引き、コストを-2する
    if (hasBlackGenbu) {
      await System.show(
        stack,
        '四聖の共鳴',
        'コスト4のユニットを引く\n四聖獣ユニットに【不屈】を付与\nカードを1枚引く\nコスト-2'
      );
      const card = EffectTemplate.draw(stack.processing.owner, stack.core);
      if (card) {
        card.delta.push(new Delta({ type: 'cost', value: -2 }));
      }
    } else {
      await System.show(
        stack,
        '四聖の共鳴＆翠檄叡智',
        'コスト4のユニットを引く\n四聖獣ユニットに【不屈】を付与'
      );
    }

    // コスト4のユニットカードをランダムで1枚手札に加える
    const [card] = EffectHelper.random(
      stack.processing.owner.deck.filter(card => card.catalog.cost === 4 && card instanceof Unit),
      1
    );
    if (card) Effect.move(stack, stack.processing, card, 'hand');
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
