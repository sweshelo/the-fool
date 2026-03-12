import { Card, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Core } from '@/package/core';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // ■起動・アウトレイジ
  // あなたのユニットを1体選ぶ。それに【スピードムーブ】と【防御禁止】を与える。
  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '起動・アウトレイジ', '【スピードムーブ】と【防御禁止】を付与');

    // ユニット選択
    const [targetUnit] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'owns',
      '【スピードムーブ】と【防御禁止】を与えるユニットを選択'
    );

    // スピードムーブを与える
    Effect.speedMove(stack, targetUnit);

    // 防御禁止を与える
    Effect.keyword(stack, stack.processing, targetUnit, '防御禁止', {
      event: 'turnEnd',
      count: 1,
    });
  },

  // ■忍び寄る羽音
  // 手札のこのカードのコストは-［あなたのフィールドの【昆虫】ユニット×1］される。このユニットのコストは4以下にならない。
  handEffect: (_core: Core, self: Card): void => {
    PermanentEffect.mount(self, {
      effect: (target, source) =>
        Effect.dynamicCost(target, {
          source,
          calculator: self =>
            -self.owner.field.filter(unit => unit.catalog.species?.includes('昆虫')).length,
        }),
      effectCode: '忍び寄る羽音',
      targets: ['self'],
    });
  },

  // ■鍬獄のカンニバル
  // このユニットがフィールドに出た時、あなたの【昆虫】ユニットを1体選ぶ。それを破壊する。
  // 対戦相手の全てのユニットに破壊したユニットのBP分のダメージを与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のフィールド上の昆虫ユニット
    const insectFilter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.id && !!unit.catalog.species?.includes('昆虫');

    if (EffectHelper.isUnitSelectable(stack.core, insectFilter, stack.processing.owner)) {
      await System.show(
        stack,
        '鍬獄のカンニバル',
        '昆虫ユニットを1体破壊\n対戦相手の全ユニットにダメージ'
      );

      // 破壊する昆虫ユニットを選択
      const [targetInsect] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        insectFilter,
        '破壊する【昆虫】ユニットを選択'
      );

      // 選択されたユニットのBPを記録
      const targetBP = targetInsect.currentBP;

      // 昆虫ユニットを破壊
      Effect.break(stack, stack.processing, targetInsect, 'effect');

      // 対戦相手の全ユニットにダメージを与える
      const enemyUnits = stack.processing.owner.opponent.field;
      for (const enemyUnit of enemyUnits) {
        Effect.damage(stack, stack.processing, enemyUnit, targetBP);
      }
    }
  },

  // Boot可能かどうかのチェック
  isBootable: (core: Core, self: Unit): boolean => {
    return EffectHelper.isUnitSelectable(core, 'owns', self.owner);
  },
};
