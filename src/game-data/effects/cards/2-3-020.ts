import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    const opponentUnits = opponent.field;

    if (opponentUnits.length > 0) {
      await System.show(
        stack,
        '獣王女の森罰＆結託の獣友',
        '基本BP-2000\n【獣】に【秩序の盾】を与える'
      );

      // ランダムで対戦相手のユニットを1体選ぶ
      const randomUnits = EffectHelper.random(opponentUnits, 1);

      if (randomUnits.length > 0 && randomUnits[0]) {
        // 選ばれたユニットの基本BPを-2000する
        Effect.modifyBP(stack, stack.processing, randomUnits[0], -2000, { isBaseBP: true });
      }
    } else {
      await System.show(stack, '結託の獣友', '【獣】に【秩序の盾】を与える');
    }
  },

  // ■獣王女の森罰
  // あなたの【獣】ユニットがフィールドに出た時、対戦相手のユニットからランダムで1体の基本BPを-2000する。
  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 召喚されたユニットが獣タイプかつ自分の所有ユニットかチェック
    const target = stack.target;
    if (
      target &&
      target instanceof Unit &&
      target.catalog.species &&
      Array.isArray(target.catalog.species) &&
      target.catalog.species.includes('獣') &&
      target.owner.id === stack.processing.owner.id &&
      target.id !== stack.processing.id // 自分自身でない
    ) {
      const opponent = stack.processing.owner.opponent;
      const opponentUnits = opponent.field;

      if (opponentUnits.length > 0) {
        await System.show(stack, '獣王女の森罰', '基本BP-2000');

        // ランダムで対戦相手のユニットを1体選ぶ
        const randomUnits = EffectHelper.random(opponentUnits, 1);

        if (randomUnits.length > 0 && randomUnits[0]) {
          // 選ばれたユニットの基本BPを-2000する
          Effect.modifyBP(stack, stack.processing, randomUnits[0], -2000, { isBaseBP: true });
        }
      }
    }
  },

  // ■結託の獣友
  // あなたのターン終了時、あなたのデッキから進化ユニット以外のコスト3以下の【獣】ユニットを1体【特殊召喚】する。
  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    // 自分のターン終了時のみ発動
    if (stack.source.id === stack.processing.owner.id) {
      const owner = stack.processing.owner;

      // デッキから進化ユニット以外のコスト3以下の【獣】ユニットをフィルタリング
      const summonTargets = owner.deck.filter(
        card =>
          card instanceof Unit &&
          !(card instanceof Evolve) &&
          card.catalog.cost <= 3 &&
          card.catalog.species &&
          Array.isArray(card.catalog.species) &&
          card.catalog.species.includes('獣')
      );

      if (summonTargets.length > 0) {
        await System.show(stack, '結託の獣友', 'デッキからコスト3以下の【獣】を【特殊召喚】');

        // ランダムで1体選択して特殊召喚
        const randomTargets = EffectHelper.random(summonTargets, 1);

        if (randomTargets.length > 0 && randomTargets[0] instanceof Unit) {
          await Effect.summon(stack, stack.processing, randomTargets[0]);
        }
      }
    }
  },

  // ■森聖なる護封陣
  // あなたのフィールドに【獣】ユニットが4体以上いる場合、あなたの【獣】ユニットに【秩序の盾】を与える。
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      effect: (card, source) => {
        if (card instanceof Unit)
          Effect.keyword(stack, stack.processing, card, '秩序の盾', { source });
      },
      condition: target =>
        target.catalog.species?.includes('獣') &&
        stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('獣')).length >=
          4,
      effectCode: '森聖なる護封陣',
      targets: ['owns'],
    });
  },
};
