import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Core } from '@/package/core';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // 【消滅効果耐性】
  // ■血濡れの妃王
  // 手札のこのカードのコストは-［お互いのトリガーゾーンの数］される。このユニットのコストは3以下にならない。
  handEffect: (core: Core, self: Unit): void => {
    PermanentEffect.mount(self, {
      effect: (target, source) => {
        Effect.dynamicCost(target, {
          source,
          calculator: self => -[...self.owner.trigger, ...self.owner.opponent.trigger].length,
        });
      },
      targets: ['self'],
      effectCode: '血濡れの妃王',
    });
  },

  // ■ヘパイストスの炉炎
  // このユニットがフィールドに出た時、またあなたのターン開始時、お互いのトリガーゾーンにあるカードを全て破壊する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await EffectHelper.combine(stack, [
      {
        title: 'ヘパイストスの炉炎',
        description: 'お互いのトリガーゾーンを全て破壊',
        effect: () => destroyAllTriggers(stack),
      },
      {
        title: '消滅効果耐性',
        description: '対戦相手の効果によって消滅しない',
        effect: () => Effect.keyword(stack, stack.processing, stack.processing, '消滅効果耐性'),
      },
    ]);
  },

  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン開始時のみ発動
    if (
      stack.source.id === stack.processing.owner.id &&
      stack.core.players.flatMap(player => player.trigger).length > 0
    ) {
      await System.show(stack, 'ヘパイストスの炉炎', 'お互いのトリガーゾーンを全て破壊');
      destroyAllTriggers(stack);
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

        // 対戦相手のユニットを選択
        const [selected] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'opponents',
          '破壊するユニットを選択して下さい'
        );

        // 選択されたユニットを破壊
        Effect.break(stack, stack.processing, selected);
      }
    }
  },
};

// トリガーゾーンのカードを全て破壊する関数
function destroyAllTriggers(stack: StackWithCard<Unit>) {
  // 全プレイヤーのトリガーゾーンを集約し、破壊
  stack.core.players
    .flatMap(player => player.trigger)
    .forEach(card => {
      Effect.break(stack, stack.processing, card);
    });
}
