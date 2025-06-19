import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Player } from '@/package/core/class/Player';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnStart: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = stack.source as Player;

    const isOpponentTurn = owner.id !== stack.source.id;
    const isOnField = opponent.field.length > 0 && owner.field.length > 0;

    console.log(isOpponentTurn && isOnField);
    return isOpponentTurn && isOnField;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    const maxCount = stack.processing.lv === 3 ? 3 : 2;

    await System.show(stack, '人身御供', `味方全体を消滅\n敵${maxCount}体を選び消滅`);
    const units = EffectHelper.candidate(
      stack.core,
      (unit: Unit) => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    // ユニットの選択を実施する
    const count = Math.min(units.length, maxCount);
    const selection: string[] = [];

    for (let i = 0; i < count; i++) {
      const [unit] = await System.prompt(stack, stack.processing.owner.id, {
        type: 'unit',
        title: '消滅させるユニットを選択',
        items: units.filter(unit => !selection.includes(unit.id)),
      });

      if (unit) selection.push(unit);
    }

    // 対戦相手のフィールドから対象のユニットを特定
    const opponentUnits = stack.core.players
      .find(player => player.id === stack.source.id)
      ?.field.filter(unit => selection.includes(unit.id));
    console.log('found -> ', opponentUnits);
    if (!opponentUnits || opponentUnits.length === 0)
      throw new Error('選択された対象ユニットが見つかりませんでした');

    [...stack.processing.owner.field, ...opponentUnits].forEach(unit =>
      Effect.delete(stack, stack.processing, unit)
    );
  },
};
