import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■雪花の指揮
  // あなたの【魔導士】ユニットが戦闘によって破壊された時、そのユニットを手札に戻す。
  // ■双愛なる圧死
  // あなたの【魔導士】ユニットが効果で破壊された時、対戦相手のユニットを1体選ぶ。それにデスカウンター［1］を与える。
  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 破壊されたのが自分の【魔導士】ユニットか確認
    if (!(stack.target instanceof Unit)) return;
    if (stack.target.owner.id !== owner.id) return;
    if (!stack.target.catalog.species?.includes('魔導士')) return;

    // 戦闘による破壊か効果による破壊かで分岐
    if (!EffectHelper.isBreakByEffect(stack)) {
      // 戦闘による破壊 - 手札に戻す
      await System.show(stack, '雪花の指揮', '【魔導士】を手札に戻す');
      Effect.move(stack, stack.processing, stack.target, 'hand');
    } else {
      // 効果による破壊 - デスカウンター付与
      const filter = (unit: Unit) => unit.owner.id !== owner.id;

      if (!EffectHelper.isUnitSelectable(stack.core, filter, owner)) return;

      await System.show(stack, '双愛なる圧死', 'デスカウンター［1］を付与');

      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        filter,
        'デスカウンター［1］を与えるユニットを選択'
      );

      Effect.death(stack, stack.processing, target, 1);
    }
  },
};
