import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { KeywordEffect } from '@/submodule/suit/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnStart: (stack: StackWithCard) => {
    return (
      EffectHelper.isUnitSelectable(stack.core, 'owns', stack.processing.owner) &&
      stack.processing.owner.id !== stack.core.getTurnPlayer().id &&
      stack.processing.owner.field.length <= 2
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    await System.show(
      stack,
      'パーフェクトテリトリー',
      '【破壊効果耐性】【消滅効果耐性】【不滅】【防御禁止】【固着】【加護】【沈黙効果耐性】を付与'
    );
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'owns',
      '効果を与えるユニットを選択してください'
    );

    (
      [
        '破壊効果耐性',
        '消滅効果耐性',
        '不滅',
        '防御禁止',
        '固着',
        '加護',
        '沈黙効果耐性',
      ] satisfies KeywordEffect[]
    ).forEach(keyword =>
      Effect.keyword(stack, stack.processing, target, keyword, { event: 'turnEnd', count: 1 })
    );
  },
};
