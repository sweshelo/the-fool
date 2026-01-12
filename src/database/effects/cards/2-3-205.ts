import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Parry } from '@/package/core/class/parry';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '究極の極み',
      'コスト3以上に【狂戦士】を与える\n【強制防御】\n【無我の境地】'
    );
    stack.processing.owner.opponent.field
      .filter(unit => unit.catalog.cost >= 3)
      .forEach(unit => Effect.keyword(stack, stack.processing, unit, '狂戦士'));
    Effect.keyword(stack, stack.processing, stack.processing, '強制防御');
    Effect.keyword(stack, stack.processing, stack.processing, '無我の境地');
  },

  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '究極の極み',
      'BP+5000\n【オーバーヒート】を得る\n全ての効果を発動できない'
    );
    Effect.modifyBP(stack, stack.processing, stack.processing as Unit, 5000, {
      event: 'turnEnd',
      count: 1,
    });
    Effect.keyword(stack, stack.processing, stack.processing, 'オーバーヒート', {
      event: 'turnEnd',
      count: 1,
    });
    stack.core.room.sync();

    throw new Parry(stack.processing);
  },

  onWinSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.lv === 3) {
      await System.show(stack, '究極の極み', '1ライフダメージ\nレベル-2');
      Effect.clock(stack, stack.processing, stack.processing, -2);
      Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
    }
  },
};
