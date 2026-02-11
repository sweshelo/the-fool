import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 【防御禁止】
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '防御禁止', 'ブロックすることができない');
    Effect.keyword(stack, stack.processing, stack.processing, '防御禁止');
  },

  // ■戦いの追憶
  // あなたのターン終了時、このユニットがレベル２以上の場合、
  // あなたのユニットを１体選ぶ。それを消滅させる。
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;

    // 自分のターン終了時のみ発動
    if (owner.id !== stack.core.getTurnPlayer().id) return;

    // レベル2以上でなければ発動しない
    if (self.lv < 2) return;

    // 自分のユニットを選択可能か確認
    if (!EffectHelper.isUnitSelectable(stack.core, 'owns', owner)) return;

    await System.show(stack, '戦いの追憶', 'ユニットを消滅させる');

    const [target] = await EffectHelper.pickUnit(stack, owner, 'owns', '消滅させるユニットを選択');

    Effect.delete(stack, self, target);
  },
};
