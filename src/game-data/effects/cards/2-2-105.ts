import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  // ■推理とは爆発だァ！
  // このユニットがフィールドに出た時、あなたの手札のカードとフィールドのユニットのレベルを+1する。
  async onDriveSelf(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;
    const handCards = owner.hand;
    const fieldUnits = owner.field;

    await System.show(stack, '推理とは爆発だァ！', '手札とフィールドのユニットのレベル+1');

    // 手札のカードのレベルを+1する
    for (const card of handCards) {
      if (card instanceof Unit) {
        card.lv = Math.min(card.lv + 1, 3);
      }
    }

    // フィールドのユニットのレベルを+1する
    for (const unit of fieldUnits) {
      Effect.clock(stack, stack.processing, unit, 1);
    }
  },

  // ■ロジックなど燃え尽きろォ！
  // あなたのユニットがオーバークロックした時、対戦相手のユニットを1体選ぶ。それに3000ダメージを与える。
  async onOverclock(stack: StackWithCard) {
    // 自分のユニットがオーバークロックした時のみ発動
    if (
      !stack.target ||
      !(stack.target instanceof Unit) ||
      stack.target.owner.id !== stack.processing.owner.id
    )
      return;

    const opponent = stack.processing.owner.opponent;
    const filter = (unit: Unit) => unit.owner.id === opponent.id;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, 'ロジックなど燃え尽きろォ！', '3000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'ダメージを与えるユニットを選んでください'
      );

      Effect.damage(stack, stack.processing, target, 3000);
    }
  },

  // ■真相はお見通しだァ！
  // このユニットが破壊された時、あなたの手札の赤属性ユニットのコストを-1する。
  async onBreakSelf(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;

    await System.show(stack, '真相はお見通しだァ！', '手札の赤属性ユニットのコスト-1');

    // 手札の赤属性ユニットを検索
    const redUnits = owner.hand.filter(
      card => card instanceof Unit && card.catalog.color === 1 // 1 = RED color enum value
    );

    if (redUnits.length > 0) {
      // 注意: ユニットのIDを指定しないDeltaを生成
      // これにより、ユニットがフィールドを離れても効果が持続する
      for (const unit of redUnits) {
        unit.delta.push(new Delta({ type: 'cost', value: -1 }));
      }
    }
  },
};
