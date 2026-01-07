import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    return (
      stack.source.id === stack.processing.owner.id &&
      (stack.processing.owner.purple ?? 0) >= 3 &&
      EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    const damage = (stack.processing.owner.purple ?? 0) >= 5 ? 5000 : 4000;

    await System.show(stack, '悪意のプレリュード', `敵1体に${damage}ダメージ\nカードを1枚引く`);
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      'ダメージを与えるユニットを選択して下さい'
    );
    Effect.damage(stack, stack.processing, target, damage, 'effect');
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
