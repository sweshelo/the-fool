import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // ■天上剣技・心眼の太刀
  // このユニットがフィールドに出た時、対戦相手は自分のトリガーゾーンを公開する。あなたはその中からカードを1枚選び、それをデッキに戻す。
  // あなたの【天使】ユニットに【破壊効果耐性】と【次元干渉／コスト3】を与える。
  // ■天命の一閃
  // このユニットがプレイヤーアタックに成功した時、あなたのライフを+1する。

  // 召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    await System.show(
      stack,
      '天上剣技・心眼の太刀',
      'トリガーゾーンを公開\n1枚選んでデッキに戻す\n【天使】に【破壊効果耐性】と【次元干渉／コスト3】を付与'
    );

    // 相手のトリガーゾーンにカードがある場合、1枚選んでデッキに戻す
    if (opponent.trigger.length > 0) {
      const [selectedCard] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        opponent.trigger,
        'デッキに戻すカードを選択',
        1
      );

      // 選んだカードをデッキに戻す
      Effect.move(stack, stack.processing, selectedCard, 'deck');
    }
  },

  // フィールド効果: 天使ユニットに破壊効果耐性と次元干渉/コスト3を与える
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns'],
      condition: unit => unit.catalog.species?.includes('天使'),
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.keyword(stack, stack.processing, unit, '破壊効果耐性', { source });
        }
      },
      effectCode: '破壊効果耐性',
    });
    PermanentEffect.mount(stack.processing, {
      targets: ['owns'],
      condition: unit => unit.catalog.species?.includes('天使'),
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.keyword(stack, stack.processing, unit, '次元干渉', { source, cost: 3 });
        }
      },
      effectCode: '次元干渉',
    });
  },

  // プレイヤーアタック成功時の効果
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分がプレイヤーアタックした時のみ処理
    if (
      stack.source instanceof Unit &&
      stack.source.id === stack.processing.id &&
      stack.target?.id === owner.opponent.id
    ) {
      await System.show(stack, '天命の一閃', 'ライフ+1');
      Effect.modifyLife(stack, stack.processing, stack.processing.owner, 1);
    }
  },
};
