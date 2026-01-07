import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );
    return (
      stack.source.id === stack.processing.owner.id &&
      (stack.processing.owner.purple ?? 0) >= 3 &&
      candidates.length > 0
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );
    const damage = (stack.processing.owner.purple ?? 0) >= 5 ? 5000 : 4000;

    await System.show(stack, '悪意のプレリュード', `敵1体に${damage}ダメージ\nカードを1枚引く`);
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      candidates,
      'ダメージを与えるユニットを選択して下さい'
    );
    Effect.damage(stack, stack.processing, target, damage, 'effect');
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
