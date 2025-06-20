import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import type { CardEffects, StackWithCard } from '../classes/types';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing as Unit;
    const owner = self.owner;

    // 対戦相手のフィールドのユニットを取得
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === owner.opponent.id,
      owner
    );

    // 紫ゲージが4以上 かつ ユニットが選択可能の場合のみ発動
    if ((owner.purple ?? 0) < 4 || candidate.length <= 0) return;

    await System.show(stack, '軍姫砲・えりすびーむ', '手札に戻す');

    // 3体まで選択
    const selected = await EffectHelper.selectUnit(
      stack,
      owner,
      candidate,
      '手札に戻すユニットを選択して下さい',
      3
    );
    if (selected.length === 0) return;

    selected.forEach(unit => Effect.bounce(stack, self, unit, 'hand'));

    // 紫ゲージを-4
    await Effect.modifyPurple(stack, self, owner, -4);
  },

  onTurnStartOpponent: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing as Unit;
    const owner = self.owner;

    // 紫ゲージが1以上で、対戦相手の手札が7枚の場合のみ発動
    if ((owner.purple ?? 0) < 1 || owner.opponent.hand.length !== 7) return;

    await System.show(stack, '理不尽な訓令', '手札を2枚捨てる');

    // 対戦相手の手札から2枚ランダムで捨てる
    EffectHelper.random(owner.opponent.hand, 2).forEach(card => Effect.handes(stack, self, card));
  },
};
