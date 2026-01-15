import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Core } from '@/package/core/core';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  // 【消滅効果耐性】
  // ■血濡れの妃王
  // 手札のこのカードのコストは-［お互いのトリガーゾーンの数］される。このユニットのコストは3以下にならない。
  handEffect: (core: Core, self: Unit): void => {
    // お互いのトリガーゾーンの数を計算
    const allTriggerCount = core.players.reduce(
      (count, player) => count + player.trigger.length,
      0
    );

    // コスト減少量（ただし、コストは3以下にならない）
    const reduction = Math.min(allTriggerCount, self.catalog.cost - 3);

    // 既にコスト減少のdeltaが存在するかチェック
    const costDelta = self.delta.find(
      delta => delta.effect.type === 'cost' && delta.source?.effectCode === '血濡れの妃王'
    );

    if (costDelta && costDelta.effect.type === 'cost') {
      // 既存のdeltaを更新
      costDelta.effect.value = -reduction;
    } else if (reduction > 0) {
      // 新しいdeltaを追加
      self.delta.push(
        new Delta(
          { type: 'cost', value: -reduction },
          {
            source: {
              unit: self.id,
              effectCode: '血濡れの妃王',
            },
          }
        )
      );
    }
  },

  // ■ヘパイストスの炉炎
  // このユニットがフィールドに出た時、またあなたのターン開始時、お互いのトリガーゾーンにあるカードを全て破壊する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await destroyAllTriggers(stack, true);
  },

  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン開始時のみ発動
    if (stack.source.id === stack.processing.owner.id) {
      await destroyAllTriggers(stack);
    }
  },

  // 対戦相手のターン終了時、対戦相手のトリガーゾーンにカードがない場合、対戦相手のユニットを1体選ぶ。それを破壊する。
  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    // 対戦相手のターン終了時のみ発動
    if (stack.source.id === stack.processing.owner.opponent.id) {
      const opponent = stack.processing.owner.opponent;

      // 対戦相手のトリガーゾーンにカードがない場合
      if (
        opponent.trigger.length === 0 &&
        EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
      ) {
        await System.show(stack, 'ヘパイストスの炉炎', 'ユニットを破壊');

        try {
          // 対戦相手のユニットを選択
          const [selected] = await EffectHelper.pickUnit(
            stack,
            stack.processing.owner,
            'opponents',
            '破壊するユニットを選択して下さい'
          );

          // 選択されたユニットを破壊
          Effect.break(stack, stack.processing, selected);
        } catch (error) {
          console.error('ユニット選択エラー:', error);
        }
      }
    }
  },
};

// トリガーゾーンのカードを全て破壊する関数
async function destroyAllTriggers(
  stack: StackWithCard<Unit>,
  drive: boolean = false
): Promise<void> {
  const allPlayers = stack.core.players;

  // 全プレイヤーのトリガーゾーンからカードを集める
  const allTriggers = allPlayers.flatMap(player => player.trigger.map(card => ({ card, player })));

  if (allTriggers.length > 0) {
    await System.show(
      stack,
      `ヘパイストスの炉炎＆消滅効果耐性`,
      `${drive ? '対戦相手の効果によって消滅しない' : ''}\nお互いのトリガーゾーンを全て破壊`
    );

    // 全てのトリガーカードを破壊
    allTriggers.forEach(({ card }) => {
      Effect.move(stack, stack.processing, card, 'trash');
    });

    if (drive) Effect.keyword(stack, stack.processing, stack.processing, '消滅効果耐性');
  } else {
    if (drive) {
      await System.show(stack, '消滅効果耐性', '対戦相手の効果によって消滅しない');
      Effect.keyword(stack, stack.processing, stack.processing, '消滅効果耐性');
    }
  }
}
