import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■神炎無双剣
  // このユニットがフィールドに出た時、対戦相手のユニットを1体選ぶ。
  // それに［対戦相手の手札の枚数×1500］ダメージを与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) return;

    const handCount = opponent.hand.length;
    const damage = handCount * 1500;

    if (damage <= 0) return;

    await System.show(stack, '神炎無双剣', '[手札の枚数×1500]ダメージ');

    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      'ダメージを与えるユニットを選択してください'
    );

    Effect.damage(stack, stack.processing, target, damage);
  },

  // ■天からの煌閃
  // このユニットがアタックした時、あなたのフィールドに【天使】ユニットが2体以上いる場合、
  // 対戦相手のユニットを1体選ぶ。それの行動権を消費する。
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 天使ユニットが2体以上いるか確認
    const angelCount = owner.field.filter(u => u.catalog.species?.includes('天使')).length;
    if (angelCount < 2) return;

    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) return;

    await System.show(stack, '天からの煌閃', '行動権を消費');

    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '行動権を消費するユニットを選択してください'
    );

    Effect.activate(stack, stack.processing, target, false);
  },
};
