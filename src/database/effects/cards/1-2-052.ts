import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【無我の境地】
  // ■神剣・草薙
  // このユニットがクロックアップするたび、このユニットの行動権を回復する。
  // このユニットがアタックした時、対戦相手のユニットを1体選ぶ。それにターン終了時まで【強制防御】を与える。
  // このユニットがフィールドでレベル3にクロックアップした時、対戦相手の全てのユニットの基本BPを-2000する。
  // このユニットに【貫通】を与える。

  // 召喚時に無我の境地を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '無我の境地', '【無我の境地】を付与');
    Effect.keyword(stack, stack.processing, stack.processing, '無我の境地');
  },

  // クロックアップ時効果
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // レベル3になった時、特別効果発動
    if (stack.processing.lv === 3) {
      await System.show(stack, '神剣・草薙', '行動権を回復\n敵全体の基本BP-2000\n【貫通】を付与');

      // 対戦相手の全ユニットのBPを-2000
      const enemyUnits = stack.processing.owner.opponent.field;
      for (const enemyUnit of enemyUnits) {
        Effect.modifyBP(stack, stack.processing, enemyUnit, -2000, { isBaseBP: true });
      }

      // 自身に貫通を付与
      Effect.keyword(stack, stack.processing, stack.processing, '貫通');
    } else {
      await System.show(stack, '神剣・草薙', '行動権を回復');
    }

    Effect.activate(stack, stack.processing, stack.processing, true);
  },

  // アタック時効果
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のユニットが存在するか確認
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    if (opponentUnits.length > 0) {
      await System.show(stack, '神剣・草薙', '【強制防御】を付与');

      // 対象を1体選択
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        opponentUnits,
        '【強制防御】を与えるユニットを選択'
      );

      // 強制防御を付与（ターン終了時まで）
      Effect.keyword(stack, stack.processing, target, '強制防御', {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
