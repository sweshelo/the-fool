import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';
import type { KeywordEffect } from '@/submodule/suit/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnStart: (stack: StackWithCard) => {
    const targets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id
    );
    return targets.length > 0 && stack.processing.owner.id !== stack.core.getTurnPlayer().id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    await System.show(
      stack,
      'パーフェクトテリトリー',
      '【破壊効果耐性】【消滅効果耐性】【不滅】【防御禁止】【固着】【加護】【沈黙効果耐性】を付与'
    );
    const targets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id
    );
    const choices: Choices = {
      title: '効果を与えるユニットを選択してください',
      type: 'unit',
      items: targets,
    };

    const [unitId] = await System.prompt(stack, stack.processing.owner.id, choices);
    const unit = stack.processing.owner.field.find(card => card.id === unitId);
    if (!unit || !(unit instanceof Unit)) throw new Error('正しいカードが選択されませんでした');

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
    ).forEach(keyword => Effect.keyword(stack, stack.processing, unit, keyword));
  },
};
