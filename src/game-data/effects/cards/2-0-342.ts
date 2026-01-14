import { Effect, System, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Card, Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  //■オリハルコンの剣
  //対戦相手のインターセプトカードの効果が発動した時、あなたのユニットを1体選ぶ。それのBPをターン終了時まで+7000する。

  checkIntercept: (stack: StackWithCard<Card>): boolean => {
    const owner = stack.processing.owner;
    const filter = (unit: Unit) => unit.owner.id === owner.id;

    //対戦相手のインターセプトカードが発動した時かつ自分のフィールドにユニットがいる場合に発動
    return (
      owner.opponent.id === stack.source.id &&
      stack.target instanceof Card &&
      stack.target.catalog.type === 'intercept' &&
      EffectHelper.isUnitSelectable(stack.core, filter, owner)
    );
  },

  onIntercept: async (stack: StackWithCard<Card>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のユニットの選択肢を作成
    const filter = (unit: Unit) => unit.owner.id === owner.id;

    await System.show(stack, 'オリハルコンの剣', 'BP+7000');

    // 自分のユニットを1体選択
    const [selectedUnit] = await EffectHelper.pickUnit(
      stack,
      owner,
      filter,
      'BPを+7000する自分のユニットを選択'
    );

    // BPを+7000（ターン終了時まで）
    Effect.modifyBP(stack, stack.processing, selectedUnit, 7000, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
