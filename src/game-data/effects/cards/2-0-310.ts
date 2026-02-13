import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

async function spiritAttackEffect(stack: StackWithCard<Unit>): Promise<void> {
  // あなたの【精霊】ユニットがアタックした時
  if (!stack.processing.catalog.species?.includes('精霊')) return;
  const filter = (unit: Unit) =>
    unit.owner.id !== stack.processing.owner.id && unit.catalog.cost <= 2;

  if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
    await System.show(stack, 'メディオクリティレスト', '行動権を消費');

    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      '行動権を消費するユニットを選択'
    );
    if (!target) return;

    Effect.activate(stack, stack.processing, target, false);
  }
}

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const spirit = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('精霊')
    ).length;
    if (spirit < 2 || stack.processing.owner.opponent.field.length === 0) return;

    const result = await EffectHelper.choice(
      stack,
      stack.processing.owner,
      '選略・ジーニアスショー',
      [
        { id: '1', description: '[【精霊】×1]体の行動権を消費' },
        {
          id: '2',
          description: 'CP-3\nランダムで2体デッキに戻す',
          condition: stack.processing.owner.cp.current >= 3,
        },
      ]
    );

    switch (result) {
      case '1': {
        await System.show(stack, '選略・ジーニアスショー', '[【精霊】×1]体の行動権を消費');
        EffectHelper.random(stack.processing.owner.opponent.field, spirit).forEach(unit =>
          Effect.activate(stack, stack.processing, unit, false)
        );
        break;
      }

      case '2': {
        await System.show(stack, '選略・ジーニアスショー', 'CP-3\nランダムで2体デッキに戻す');
        Effect.modifyCP(stack, stack.processing, stack.processing.owner, -3);
        EffectHelper.random(stack.processing.owner.opponent.field, 2).forEach(unit =>
          Effect.bounce(stack, stack.processing, unit, 'deck')
        );
        break;
      }
    }
  },

  // アタック時の効果
  onAttackSelf: spiritAttackEffect,
  onAttack: async (stack: StackWithCard<Unit>) => {
    if (stack.target instanceof Unit && stack.target.id === stack.processing.id) return;
    await spiritAttackEffect(stack);
  },
};
