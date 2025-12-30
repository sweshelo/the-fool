import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // このユニットが戦闘した時、戦闘中の相手ユニットを破壊する。このユニットの行動権を消費する。
  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const target = stack.processing.id === stack.target?.id ? stack.source : stack.target;
    if (target instanceof Unit) {
      await System.show(stack, '秘技・無明剣', '戦闘中の相手ユニットを破壊\n行動権消費');

      // 戦闘中の相手ユニットを破壊
      Effect.break(stack, stack.processing, target, 'effect');

      // 自身の行動権を消費
      Effect.activate(stack, stack.processing, stack.processing, false);
    }
  },

  // あなたのターン開始時、このユニットの基本BPを-1000する。
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターンの開始時に発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await System.show(stack, '病弱の天才剣士', 'BP-1000');

      // BPを-1000する
      Effect.modifyBP(stack, stack.processing, stack.processing, -1000, {
        isBaseBP: true,
      });
    }
  },

  // このユニットが破壊された時、あなたのフィールドに【侍】ユニットが3体以上いる場合、あなたのデッキから【侍】ユニットを1枚選んで手札に加える。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // フィールド上の侍ユニットを数える
    const samuraiCount = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('侍')
    ).length;

    // 侍ユニットが3体以上いる場合
    if (samuraiCount >= 3) {
      // デッキから侍ユニットを探す
      const samuraiUnits = stack.processing.owner.deck.filter(
        card => card instanceof Unit && card.catalog.species?.includes('侍')
      );

      if (samuraiUnits.length > 0) {
        await System.show(stack, '誠の旗の下に', 'デッキから【侍】ユニットを1枚手札に加える');

        // 侍ユニットを選択
        const [target] = await EffectHelper.selectCard(
          stack,
          stack.processing.owner,
          samuraiUnits,
          '手札に加える【侍】ユニットを選択してください',
          1
        );

        // 選んだカードを手札に加える
        Effect.move(stack, stack.processing, target, 'hand');
      }
    }
  },
};
