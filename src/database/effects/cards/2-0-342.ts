import { Effect, System, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Card } from '@/package/core/class/card';

export const effects: CardEffects = {
  //■オリハルコンの剣
  //対戦相手のインターセプトカードの効果が発動した時、あなたのユニットを1体選ぶ。それのBPをターン終了時まで+7000する。

  checkIntercept: (stack: StackWithCard<Card>): boolean => {
    const owner = stack.processing.owner;
    const ownUnitsFilter = (unit: Unit) => unit.owner.id === owner.id;
    const ownUnits_selectable = EffectHelper.isUnitSelectable(stack.core, ownUnitsFilter, owner);

    //対戦相手のインターセプトカードが発動した時かつ自分のフィールドにユニットがいる場合に発動
    return (
      owner.opponent.id === stack.source.id &&
      stack.target instanceof Card &&
      stack.target.catalog.type === 'intercept' &&
      ownUnits_selectable
    );
  },

  onIntercept: async (stack: StackWithCard<Card>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のユニットの選択肢を作成
    const ownUnitsFilter = (unit: Unit) => unit.owner.id === owner.id;
    const ownUnits_selectable = EffectHelper.isUnitSelectable(stack.core, ownUnitsFilter, owner);

    await System.show(stack, 'オリハルコンの剣', 'BP+7000');

    // 自分のユニットを1体選択
    const [selectedUnit] = await EffectHelper.pickUnit(
      stack,
      owner,
      ownUnitsFilter,
      'BPを+7000する自分のユニットを選択'
    );

    // BPを+7000（ターン終了時まで）
    Effect.modifyBP(stack, stack.processing, selectedUnit, 7000, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
