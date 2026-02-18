import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

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
    const owner = stack.processing.owner;

    // 天使ユニットに効果を付与
    owner.field.forEach(unit => {
      if (unit.catalog.species?.includes('天使')) {
        // 既にこのユニットが発行したDeltaが存在するか確認（破壊効果耐性）
        const breakResistDelta = unit.delta.find(
          d => d.source?.unit === stack.processing.id && d.source?.effectCode === '破壊効果耐性'
        );

        // 破壊効果耐性が付与されていなければ付与
        if (!breakResistDelta) {
          Effect.keyword(stack, stack.processing, unit, '破壊効果耐性', {
            source: { unit: stack.processing.id, effectCode: '破壊効果耐性' },
          });
        }

        // 既にこのユニットが発行したDeltaが存在するか確認（次元干渉/コスト3）
        const dimensionDelta = unit.delta.find(
          d => d.source?.unit === stack.processing.id && d.source?.effectCode === '次元干渉'
        );

        // 次元干渉が付与されていなければ付与
        if (!dimensionDelta) {
          Effect.keyword(stack, stack.processing, unit, '次元干渉', {
            source: { unit: stack.processing.id, effectCode: '次元干渉' },
            cost: 3, // コスト3を指定
          });
        }
      }
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

      // ライフを+1する（最大値を超えないように）
      owner.life.current = Math.min(owner.life.current + 1, owner.life.max);
    }
  },
};
