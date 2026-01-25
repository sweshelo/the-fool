import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■忍びの里
  // あなたの【忍者】ユニットがフィールドに出た時、あなたのフィールドにユニットが4体以下の場合、それをあなたのフィールドに【複製】し、手札に戻す。
  // あなたの【忍者】ユニット以外のユニットがフィールドに出た時、【忍者】ユニットのカードを1枚ランダムで手札に加える。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のユニットが出た時のみ発動
    if (stack.source.id !== owner.id) return false;
    if (!(stack.target instanceof Unit)) return false;

    const isNinja = stack.target.catalog.species?.includes('忍者') === true;

    if (isNinja) {
      // 忍者の場合、フィールドが4体以下か確認
      return owner.field.length <= 4;
    } else {
      // 忍者以外の場合は常に発動（デッキに忍者がいなくても発動する）
      return true;
    }
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    if (!(stack.target instanceof Unit)) return;

    const isNinja = stack.target.catalog.species?.includes('忍者') === true;

    if (isNinja) {
      // 忍者ユニットの場合
      await System.show(stack, '忍びの里', '【忍者】を【複製】して手札に戻す');

      // 複製する
      await Effect.clone(stack, stack.processing, stack.target, owner);

      // 元のユニットを手札に戻す
      Effect.bounce(stack, stack.processing, stack.target, 'hand');
    } else {
      // 忍者以外のユニットの場合
      await System.show(stack, '忍びの里', '【忍者】を手札に加える');

      // デッキから忍者ユニットをランダムで1枚手札に加える
      EffectTemplate.reinforcements(stack, owner, { species: '忍者' });
    }
  },
};
