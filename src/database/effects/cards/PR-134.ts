import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■起動・結びリバーブ
  // このユニットを破壊する。そうした場合、あなたの【道化師】ユニットを1体選ぶ。それの行動権を回復する
  isBootable: (core, self) => {
    // 自分以外の【道化師】ユニットがいるか確認
    const clowns = self.owner.field.filter(
      unit => unit.id !== self.id && unit.catalog.species?.includes('道化師')
    );
    return clowns.length > 0;
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分以外の【道化師】ユニット
    const clowns = owner.field.filter(
      unit => unit.id !== stack.processing.id && unit.catalog.species?.includes('道化師')
    );

    if (clowns.length === 0) return;

    await System.show(stack, '起動・結びリバーブ', '自身を破壊\n【道化師】の行動権回復');

    // このユニットを破壊する
    Effect.break(stack, stack.processing, stack.processing);

    // 【道化師】ユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      unit => unit.catalog.species?.includes('道化師') === true && unit.owner.id === owner.id,
      '行動権を回復するユニットを選択'
    );

    // 行動権を回復する
    Effect.activate(stack, stack.processing, target, true);
  },

  // ■覚醒のエコー
  // あなたのターン終了時、対戦相手のフィールドに行動済ユニットがいる場合、
  // あなたのユニットを1体選ぶ。それの行動権を回復する
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン終了時のみ発動
    if (stack.processing.owner.id !== stack.core.getTurnPlayer().id) return;

    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のフィールドに行動済ユニットがいるか確認
    const hasInactiveOpponentUnit = opponent.field.some(unit => !unit.active);
    if (!hasInactiveOpponentUnit) return;

    // 自分のフィールドにユニットがいるか確認
    if (!EffectHelper.isUnitSelectable(stack.core, 'owns', owner)) return;

    await System.show(stack, '覚醒のエコー', '行動権回復');

    // 自分のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'owns',
      '行動権を回復するユニットを選択'
    );

    Effect.activate(stack, stack.processing, target, true);
  },
};
