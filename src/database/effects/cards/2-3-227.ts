import { Card, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core';
import { Delta } from '@/package/core/class/delta';

// カードがフィールドにあるかをカタログの name で判断するヘルパー関数
const hasFourGodCard = (stack: StackWithCard<Unit>, name: string): boolean => {
  return stack.processing.owner.field.some(unit => unit.catalog.name === name);
};

// ブラック四聖獣が全揃っているかチェック
const hasAllBlackFourGods = (stack: StackWithCard<Unit>): boolean => {
  return (
    hasFourGodCard(stack, 'ブラック青龍') &&
    hasFourGodCard(stack, 'ブラック朱雀') &&
    hasFourGodCard(stack, 'ブラック白虎') &&
    hasFourGodCard(stack, 'ブラック玄武')
  );
};

export const effects: CardEffects = {
  // 手札のこのカードのコストは-［あなたの捨札の【四聖獣】×1］される。このユニットのコストは3以下にならない。
  handEffect: (core: Core, self: Card): void => {
    // 捨札の【四聖獣】ユニット数を数える
    const fourGodCount = self.owner.trash.filter(
      card => card instanceof Unit && card.catalog.species?.includes('四聖獣')
    ).length;
    const delta = self.delta.find(delta => delta.source?.unit === self.id);
    const reduce = Math.max(-fourGodCount, -12);

    if (delta && delta.effect.type === 'cost') {
      delta.effect.value = reduce;
    } else {
      self.delta.push(
        new Delta(
          { type: 'cost', value: reduce },
          {
            source: {
              unit: self.id,
            },
          }
        )
      );
    }
  },

  // このユニットがフィールドに出た時、あなたの捨札から【四聖獣】をランダムで4体まで【特殊召喚】する。［黄龍］を1枚作成する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '四聖の湧力＆鎧袖一触・四聖陣',
      '捨札から【四聖獣】をランダムで4体まで【特殊召喚】\n［黄龍］を1枚作成'
    );

    // 捨札にある【四聖獣】ユニットを取得
    const fourGodUnitsInTrash = stack.processing.owner.trash.filter(
      card => card instanceof Unit && card.catalog.species?.includes('四聖獣')
    );

    // 特殊召喚する枚数（最大4体まで、フィールドの空きも考慮）
    const maxSummonCount = Math.min(
      4,
      fourGodUnitsInTrash.length,
      5 - stack.processing.owner.field.length
    );

    if (maxSummonCount > 0) {
      // ランダムに選択
      const randomUnits = EffectHelper.random(fourGodUnitsInTrash, maxSummonCount);

      // 特殊召喚
      for (const unit of randomUnits) {
        if (unit instanceof Unit) {
          await Effect.summon(stack, stack.processing, unit);
        }
      }
    }

    // [黄龍]を1枚作成する
    Effect.make(stack, stack.processing.owner, '1-3-215');
  },

  // あなたのターン開始時、あなたのフィールドに［ブラック四聖獣］が全ている場合、対戦相手の手札、フィールド、トリガーゾーンからランダムで4枚消滅させる。
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターンの開始時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      // ブラック四聖獣が全揃っているかチェック
      if (hasAllBlackFourGods(stack)) {
        await System.show(
          stack,
          '鎧袖一触・四聖陣',
          '対戦相手の手札/フィールド/トリガーから4枚消滅'
        );

        // 対戦相手の手札、フィールド、トリガーゾーンのカードをリストアップ
        const opponent = stack.processing.owner.opponent;
        const targetCards = [...opponent.hand, ...opponent.field, ...opponent.trigger];

        // 消滅させる枚数（最大4枚まで）
        const deleteCount = Math.min(4, targetCards.length);

        if (deleteCount > 0) {
          // ランダムに選択
          const randomCards = EffectHelper.random(targetCards, deleteCount);

          // 選択したカードを消滅させる
          for (const card of randomCards) {
            // カードの位置によって処理を分ける
            const cardLocation = opponent.find(card);

            if (cardLocation.result && cardLocation.place) {
              if (cardLocation.place.name === 'field' && card instanceof Unit) {
                // フィールド上のユニットは消滅効果で処理
                Effect.delete(stack, stack.processing, card);
              } else {
                // それ以外のカードはmoveで消滅札に送る
                Effect.move(stack, stack.processing, card, 'delete');
              }
            }
          }
        }
      }
    }
  },
};
