import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【呪縛】【固着】キーワード能力付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // キーワード能力を付与

    // 捕喰：フィールドに出た時に自分の他のユニットを全て破壊
    await System.show(stack, '捕喰', '自身以外のユニットを破壊');

    const ownUnits = stack.processing.owner.field.filter(unit => unit.id !== stack.processing.id);

    ownUnits.forEach(unit => {
      Effect.break(stack, stack.processing, unit);
    });

    Effect.keyword(stack, stack.processing, stack.processing, '呪縛', {
      source: { unit: stack.processing.id },
    });
    Effect.keyword(stack, stack.processing, stack.processing, '固着', {
      source: { unit: stack.processing.id },
    });
  },

  // ユニットがフィールドに出た時の効果
  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のユニットがフィールドに出た時
    const summonedUnit = stack.target;
    if (
      summonedUnit instanceof Unit &&
      summonedUnit.owner.id === stack.processing.owner.id &&
      summonedUnit.id !== stack.processing.id
    ) {
      await System.show(stack, '捕喰', 'ユニットを破壊\n行動権を回復');

      // そのユニットを破壊
      Effect.break(stack, stack.processing, summonedUnit);

      // 自身の行動権を回復
      Effect.activate(stack, stack.processing, stack.processing, true);
    }
  },

  // 戦闘勝利時もしくはプレイヤーアタック成功時
  onWinSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '滅亡', '基本BP-3000');
    Effect.modifyBP(stack, stack.processing, stack.processing, -3000, { isBaseBP: true });
  },

  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '滅亡', '基本BP-3000');
    Effect.modifyBP(stack, stack.processing, stack.processing, -3000, { isBaseBP: true });
  },
};
