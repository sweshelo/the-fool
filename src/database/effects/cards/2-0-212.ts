import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■戦友と共に
  // このユニットがフィールドに出た時、また効果によって破壊された時、あなたのフィールドのユニットが4体以下の場合、
  // あなたの捨札にある進化ユニット以外のコスト3以下の【侍】ユニットを1体【特殊召喚】する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const candidate = stack.processing.owner.trash.filter(
      card =>
        card instanceof Unit &&
        !(card instanceof Evolve) &&
        card.catalog.cost <= 3 &&
        card.catalog.species?.includes('侍')
    ) as Unit[];

    if (stack.processing.owner.field.length <= 4 && candidate.length > 0) {
      await System.show(stack, '戦友と共に', '捨札から【侍】を【特殊召喚】');
      const [target] = EffectHelper.random(candidate);
      await Effect.summon(stack, stack.processing, target!);
    }
  },

  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const candidate = stack.processing.owner.trash.filter(
      card =>
        card instanceof Unit &&
        !(card instanceof Evolve) &&
        card.catalog.cost <= 3 &&
        card.catalog.species?.includes('侍')
    ) as Unit[];

    if (stack.processing.owner.field.length <= 4 && candidate.length > 0) {
      await System.show(stack, '戦友と共に', '捨札から【侍】を【特殊召喚】');
      const [target] = EffectHelper.random(candidate);
      await Effect.summon(stack, stack.processing, target!);
    }
  },

  // ■壬生の鬼
  // このユニットが戦闘した時、それがアタック中であなたのフィールドに【侍】ユニットが3体以上いる場合、
  // 戦闘中の相手ユニットに【沈黙】を与え、それを破壊する。
  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const isAttacking = stack.processing.id === stack.source.id;
    const samuraiCount = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('侍')
    ).length;

    if (isAttacking && samuraiCount >= 3) {
      await System.show(stack, '壬生の鬼', '【沈黙】を与え破壊する');

      // 戦闘中の相手ユニットを特定
      const opponent = stack.target as Unit;

      if (opponent) {
        Effect.keyword(stack, stack.processing, opponent, '沈黙');
        Effect.break(stack, stack.processing, opponent, 'effect');
      }
    }
  },
};
