import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■ニードルレイン
  // ［▲3］あなたのユニットがフィールドに出た時、あなたの紫ゲージが３以上４以下の場合、
  // 全てのユニットに２０００ダメージを与える。あなたはカードを１枚引く。
  // あなたの紫ゲージが５以上の場合、
  // 全てのユニットに３０００ダメージを与える。あなたはインターセプトカードを１枚引く。

  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    if (!(stack.target instanceof Unit) || stack.target.owner.id !== owner.id) return false;
    return (owner.purple ?? 0) >= 3;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const purple = owner.purple ?? 0;
    const allUnits = stack.core.players.map(p => p.field).flat();

    if (purple >= 5) {
      await System.show(stack, 'ニードルレイン', '3000ダメージ\nインターセプトカードを1枚引く');
      allUnits.forEach(unit => Effect.damage(stack, stack.processing, unit, 3000));
      EffectTemplate.reinforcements(stack, owner, { type: ['intercept'] });
    } else {
      await System.show(stack, 'ニードルレイン', '2000ダメージ\nカードを1枚引く');
      allUnits.forEach(unit => Effect.damage(stack, stack.processing, unit, 2000));
      EffectTemplate.draw(owner, stack.core);
    }
  },
};
