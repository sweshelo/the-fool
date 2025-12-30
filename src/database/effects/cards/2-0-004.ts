import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【狂戦士】【スピードムーブ】
  // ■アタッカー
  // このユニットがアタックした時、ターン終了時までこのユニットのBPを+2000する。
  // ■狂獣乱破
  // このユニットが戦闘した時、それがアタック中だった場合、対戦相手のユニットからランダムで1体に5000ダメージを与える。

  // 召喚時の効果：キーワード能力を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '狂戦士＆スピードムーブ',
      'ターン開始時に強制的にアタックする\n行動制限の影響を受けない'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '狂戦士');
    Effect.speedMove(stack, stack.processing);
  },

  // アタック時の効果
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'アタッカー', 'BP+2000');

    // BP+2000（ターン終了時まで）
    Effect.modifyBP(stack, stack.processing, stack.processing, 2000, {
      event: 'turnEnd',
      count: 1,
    });
  },

  // 戦闘時の効果
  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分自身の戦闘時かつアタック中かどうかを確認
    // アタック中の場合、stack.sourceが自分自身になる
    if (stack.processing.id === stack.source.id) {
      const opponent = stack.processing.owner.opponent;

      // 相手ユニットがいない場合は効果発動しない
      if (opponent.field.length === 0) return;

      await System.show(stack, '狂獣乱破', '敵に5000ダメージ');
      EffectHelper.random(opponent.field, 1).forEach(unit =>
        Effect.damage(stack, stack.processing, unit, 5000)
      );
    }
  },
};
