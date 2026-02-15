import { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    // 紫ゲージが4以上 かつ ユニットが選択可能の場合のみ発動
    if (
      (owner.purple ?? 0) < 4 ||
      !EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    ) {
      // 条件を満たさない場合：セレクトハックのみ
      await System.show(stack, 'セレクトハック', 'このユニットを選ばなければならない');
      Effect.keyword(stack, self, self, 'セレクトハック');
    } else {
      // 条件を満たす場合は、3体まで選択して手札に戻し、さらに自身に【セレクトハック】を付与
      await System.show(
        stack,
        '軍姫砲・えりすびーむ',
        '3体まで手札に戻す\nこのユニットを選ばなければならない'
      );
      Effect.keyword(stack, self, self, 'セレクトハック');
    }

    // 3体まで選択
    const selected = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '手札に戻すユニットを選択',
      3
    );
    if (selected.length === 0) return;

    selected.forEach(unit => Effect.bounce(stack, self, unit, 'hand'));

    // 紫ゲージを-4
    await Effect.modifyPurple(stack, self, owner, -4);
  },

  onTurnStart: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    // 紫ゲージが1以上で、対戦相手の手札が7枚の場合のみ発動
    if (
      (owner.purple ?? 0) < 1 ||
      owner.opponent.hand.length !== 7 ||
      stack.processing.owner.id === stack.source.id
    )
      return;

    await System.show(stack, '理不尽な訓令', '手札を2枚破壊');

    // 対戦相手の手札から2枚ランダムで捨てる
    EffectHelper.random(owner.opponent.hand, 2).forEach(card => Effect.break(stack, self, card));
  },
};
