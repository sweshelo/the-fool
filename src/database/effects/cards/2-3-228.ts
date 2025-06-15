import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  isBootable: (core: Core, self: Unit) => {
    const owner = self.owner;
    // 他の不死ユニットが存在するかチェック
    return owner.field.some(
      unit =>
        unit.owner.id === owner.id && unit.catalog.species?.includes('不死') && unit.id !== self.id
    );
  },

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    // 紫ゲージが3以上の場合、貫通を付与
    if ((owner.purple ?? 0) >= 3) {
      await System.show(
        stack,
        'ペイン・オブ・デッド&スピードムーブ',
        '【貫通】を得る\n行動制限の影響を受けない'
      );
      Effect.keyword(stack, self, self, '貫通');
    } else {
      await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');
    }

    Effect.speedMove(stack, self);
  },

  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing as Unit;
    const opponent = self.owner.opponent;

    // アクティブな相手ユニットをランダムに1体選んで8000ダメージ
    const activeUnits = opponent.field.filter(unit => unit.active);
    if (activeUnits.length > 0) {
      const target = activeUnits[Math.floor(Math.random() * activeUnits.length)];
      if (target) {
        await System.show(stack, 'ペイン・オブ・デッド', '8000ダメージ');
        Effect.damage(stack, self, target, 8000);
      }
    }
  },

  onBootSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing as Unit;
    const owner = self.owner;
    await System.show(stack, 'ペイン・オブ・デッド', '【不死】を破壊\n基本BP-2000\n行動権を回復');

    // 他の不死ユニットを破壊
    const undeadUnits = owner.field.filter(
      unit => unit.catalog.species?.includes('不死') && unit.id !== self.id
    );
    for (const unit of undeadUnits) {
      Effect.break(stack, self, unit, 'effect');
    }

    // 基本BPを-2000
    Effect.modifyBP(stack, self, self, -2000, { isBaseBP: true });

    // 行動権を回復
    Effect.activate(stack, self, self, true);
  },
};
