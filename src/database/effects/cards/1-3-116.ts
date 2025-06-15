import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // プレイヤーアタック時効果
  onPlayerAttack: async (stack: StackWithCard<Unit>) => {
    const units = EffectHelper.candidate(stack.core, () => true, stack.processing.owner);
    if (units.length === 0 || stack.processing.owner.id !== stack.target?.id) return;
    await System.show(stack, 'カウンター・クロック', 'レベル+1');
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      units,
      'レベルを+1するユニットを選択',
      1
    );
    Effect.clock(stack, stack.processing, target, 1);
  },

  // 対戦相手のターン開始時効果
  onTurnStart: async (stack: StackWithCard<Unit>) => {
    const warriorUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.catalog.species?.includes('戦士') ?? false,
      stack.processing.owner
    );
    if (warriorUnits.length === 0) return;
    await System.show(stack, '竜兵の底力', '【戦士】ユニットの基本BP+1000');
    warriorUnits.forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, 1000, { isBaseBP: true });
    });
  },

  // 【戦士】ユニットがアタックした時効果
  onAttack: async (stack: StackWithCard<Unit>) => {
    if (!(stack.target instanceof Unit) || !stack.target.catalog.species?.includes('戦士')) return;
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );
    if (opponentUnits.length === 0) return;
    await System.show(stack, '竜兵の力', '【強制防御】を付与');
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      opponentUnits,
      '【強制防御】を与えるユニットを選択',
      1
    );
    Effect.keyword(stack, stack.processing, target, '強制防御', { event: 'turnEnd', count: 1 });
  },
};
