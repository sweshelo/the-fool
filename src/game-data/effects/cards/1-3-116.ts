import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■カウンター・クロック
  // あなたがプレイヤーアタックを受けるたび
  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    if (stack.target?.id === stack.processing.owner.id) {
      const filter = (unit: Unit) => unit.lv < 3;

      if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        await System.show(stack, 'カウンター・クロック', 'レベル+1');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          'レベルを上げるユニットを選択'
        );
        Effect.clock(stack, stack.processing, target, 1);
      }
    }
  },

  // 対戦相手のターン開始時効果
  onTurnStart: async (stack: StackWithCard<Unit>) => {
    const turnPlayer = stack.core.getTurnPlayer();
    // 自分のターン開始時は発動しない
    if (turnPlayer.id === stack.processing.owner.id) return;

    const warriorUnits = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('戦士')
    );
    if (warriorUnits.length === 0) return;
    await System.show(stack, '竜兵の底力', '【戦士】ユニットの基本BP+1000');
    warriorUnits.forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, 1000, { isBaseBP: true });
    });
  },

  // 【戦士】ユニットがアタックした時効果
  onAttack: async (stack: StackWithCard<Unit>) => {
    const attacker = stack.target;
    // 攻撃者がユニットで、かつこの効果の所有者のユニットで、【戦士】であることを確認
    if (
      !(attacker instanceof Unit) ||
      attacker.owner.id !== stack.processing.owner.id ||
      !attacker.catalog.species?.includes('戦士')
    )
      return;
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    if (!EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) return;
    await System.show(stack, '竜兵の力', '【強制防御】を付与');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '【強制防御】を与えるユニットを選択'
    );
    Effect.keyword(stack, stack.processing, target, '強制防御', { event: 'turnEnd', count: 1 });
  },
};
