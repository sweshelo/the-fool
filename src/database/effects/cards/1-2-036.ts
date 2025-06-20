import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const target = stack.target instanceof Unit ? stack.target : undefined;

    // 対象が進化ユニットでない、または対象が対戦相手のユニットでない場合は発動しない
    if (
      !target ||
      target.catalog.type !== 'advanced_unit' ||
      target.owner.id !== self.owner.opponent.id
    )
      return;

    await System.show(stack, '海鳴のセレナーデ', 'ライフ-2');
    Effect.modifyLife(stack, target.owner, -2);
  },

  onPlayerAttack: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    // 対象が対戦相手のユニットか確認
    if (
      !(stack.source instanceof Unit) ||
      stack.source.owner.id !== stack.processing.owner.opponent.id
    )
      return;

    // 捨札にカードが存在するか確認
    if (owner.trash.length === 0) return;

    await System.show(stack, '水の守護精霊', '捨札から手札に加える');

    // 捨札からランダムで1枚選ぶ
    const randomIndex = Math.floor(Math.random() * owner.trash.length);
    const target = owner.trash[randomIndex];

    if (target) {
      Effect.move(stack, self, target, 'hand');
    }
  },
};
