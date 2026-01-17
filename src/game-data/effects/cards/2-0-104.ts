import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■マシン・バースト
  // あなたの【機械】ユニットがフィールドに出た時、対戦相手のユニットを1体選ぶ。それに2000ダメージを与える。
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;

    // 召喚されたユニットが機械タイプかつ自分の所有ユニットかチェック
    if (
      stack.target instanceof Unit &&
      Array.isArray(stack.target.catalog.species) &&
      stack.target.catalog.species.includes('機械') &&
      stack.target.owner.id === owner.id
    ) {
      // 対戦相手のフィールドにユニットがいるか確認
      if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        await System.show(stack, 'マシン・バースト', '2000ダメージ');

        // 対戦相手のユニットを1体選択
        const [target] = await EffectHelper.pickUnit(
          stack,
          owner,
          filter,
          '2000ダメージを与えるユニットを選択'
        );

        if (target) {
          // 2000ダメージを与える
          Effect.damage(stack, stack.processing, target, 2000);
        }
      }
    }
  },

  // ■更なる巨大化
  // あなたのインターセプトカードが発動するたび、このユニットの基本BPを+2000する。
  onIntercept: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のインターセプトカードが発動した場合のみ処理
    if (stack.source.id === stack.processing.owner.id) {
      await System.show(stack, '更なる巨大化', '基本BP+2000');
      Effect.modifyBP(stack, stack.processing, stack.processing, 2000, { isBaseBP: true });
    }
  },

  // ■巨躯の一撃
  // このユニットのBPが8000以上の時、このユニットに【貫通】を与える。
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    const self = stack.processing;

    // すでに付与された貫通効果がないか確認
    const delta = self.delta.find(
      delta =>
        delta.source?.unit === self.id && delta.source?.effectCode === 'giant_attack_penetration'
    );

    if (self.bp >= 8000) {
      // BP8000以上で貫通を付与
      if (!delta) {
        Effect.keyword(stack, self, self, '貫通', {
          source: { unit: self.id, effectCode: 'giant_attack_penetration' },
        });
      }
    } else if (delta) {
      // BP8000未満になった場合、効果を削除
      self.delta = self.delta.filter(
        d => d.source?.unit !== self.id || d.source?.effectCode !== 'giant_attack_penetration'
      );
    }
  },
};
