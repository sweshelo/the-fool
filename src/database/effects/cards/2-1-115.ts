import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // フィールドにユニットが4体以下かチェック
    if (owner.field.length <= 4) {
      // 捨札から条件に合致するユニットを探す
      // 進化ユニット以外のコスト7以下の青属性のユニット
      const candidates = owner.trash.filter(
        card =>
          card instanceof Unit &&
          !(card instanceof Evolve) &&
          card.catalog.color === Color.BLUE &&
          card.catalog.cost <= 7
      ) as Unit[];

      if (candidates.length > 0) {
        await System.show(stack, '冥霊の目醒め', '捨札から【特殊召喚】\nレベル+2');

        // ユニット選択
        const [target] = await EffectHelper.selectCard(
          stack,
          owner,
          candidates,
          '【特殊召喚】するユニットを選択'
        );

        if (target instanceof Unit) {
          // 特殊召喚
          const summonedUnit = await Effect.summon(stack, stack.processing, target);

          // レベルを+2する
          if (summonedUnit) {
            Effect.clock(stack, stack.processing, summonedUnit, 2);
          }
        }
      }
    }
  },

  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のユニットを取得
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, '審命の布告', 'デスカウンター[1]を与える');

      // ユニット選択
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'デスカウンター[1]を与えるユニットを選択'
      );

      // デスカウンターを与える
      Effect.death(stack, stack.processing, target, 1);
    }
  },
};
