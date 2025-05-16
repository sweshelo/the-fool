import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

// フィールド上の【四聖獣】ユニット数を数える
const countFourGodUnits = (stack: StackWithCard<Unit>): number => {
  return stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('四聖獣'))
    .length;
};

export const effects: CardEffects = {
  // 【スピードムーブ】 - フィールドに出た時に【スピードムーブ】を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');
    Effect.speedMove(stack, stack.processing);
  },

  // このユニットがアタックした時、対戦相手のユニットを1体選ぶ。それに［【四聖獣】×2000］ダメージを与える。
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のユニットを取得
    const oppUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (oppUnits.length > 0) {
      // 四聖獣ユニットの数を数える
      const fourGodCount = countFourGodUnits(stack);
      const damage = fourGodCount * 2000;

      await System.show(stack, '朱天無双', `敵ユニットに${damage}ダメージ`);

      // 対戦相手のユニットを1体選択
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        oppUnits,
        'ダメージを与えるユニットを選択してください',
        1
      );

      // 選択したユニットにダメージを与える
      Effect.damage(stack, stack.processing, target, damage, 'effect');
    }
  },

  // このユニットがプレイヤーアタックに成功した時、対戦相手のユニットを1体選ぶ。それに【狂戦士】を与える。
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のユニットを取得
    const oppUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (oppUnits.length > 0) {
      await System.show(stack, '紅翼黒天翔', '敵ユニットに【狂戦士】を付与');

      // 対戦相手のユニットを1体選択
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        oppUnits,
        '【狂戦士】を付与するユニットを選択してください',
        1
      );

      // 選択したユニットに【狂戦士】を付与
      Effect.keyword(stack, stack.processing, target, '狂戦士');
    }
  },

  // 起動・四聖の殉国: デッキから【四聖獣】を1体選んで捨てる。
  isBootable: (core, self): boolean => {
    // デッキに【四聖獣】ユニットがあるかチェック
    return self.owner.deck.some(
      card => card instanceof Unit && card.catalog.species?.includes('四聖獣')
    );
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '起動・四聖の殉国', 'デッキから【四聖獣】を1体選んで捨てる');

    // デッキから【四聖獣】ユニットを抽出
    const fourGodUnits = stack.processing.owner.deck.filter(
      card => card instanceof Unit && card.catalog.species?.includes('四聖獣')
    );

    if (fourGodUnits.length > 0) {
      // 【四聖獣】ユニットを選択
      const [target] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        fourGodUnits,
        '捨てる【四聖獣】ユニットを選択してください',
        1
      );

      // 選択したユニットを捨札に送る
      Effect.move(stack, stack.processing, target, 'trash');
    }
  },
};
