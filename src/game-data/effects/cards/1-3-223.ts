import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■永遠を授かりし者
  // このユニットがフィールドに出た時、あなたの【不死】ユニットを2体選ぶ。それらを消滅させる。そうした場合、このユニットに【不滅】を与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;

    // 自分のフィールドに【不死】ユニットが2体以上いるか確認
    const immortalFilter = (unit: Unit) =>
      unit.owner.id === owner.id && unit.id !== self.id && unit.catalog.species?.includes('不死');

    const immortalUnits = owner.field.filter(immortalFilter);
    if (immortalUnits.length < 2) return;

    await System.show(stack, '永遠を授かりし者', '【不死】を2体消滅\n【不滅】を得る');

    // 【不死】ユニットを2体選ぶ
    const targets = await EffectHelper.pickUnit(
      stack,
      owner,
      immortalFilter,
      '消滅させる【不死】ユニットを選択',
      2
    );

    // 選択したユニットを消滅させる
    for (const target of targets) {
      Effect.delete(stack, self, target);
    }

    // このユニットに【不滅】を与える
    Effect.keyword(stack, self, self, '不滅');
  },

  // このユニットが破壊された時、あなたの捨札からユニットカードをランダムで2体まで手札に加える。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '永遠を授かりし者', '捨札からユニットカードを2枚回収');

    // 捨札のユニットカードをフィルタリング
    const unitCards = owner.trash.filter(card => card.catalog.type === 'unit');
    if (unitCards.length === 0) return;

    // ランダムで2体まで選んで手札に加える
    EffectHelper.random(unitCards, 2).forEach(card => {
      Effect.move(stack, stack.processing, card, 'hand');
    });
  },

  // ■至りし境地
  // このユニットがオーバークロックした時、このユニットに【沈黙】を与える。
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '至りし境地', '【沈黙】を付与');
    Effect.keyword(stack, stack.processing, stack.processing, '沈黙');
  },
};
