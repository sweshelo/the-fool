import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 召喚時に【スピードムーブ】を付与
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');
    Effect.speedMove(stack, stack.processing);
  },

  // アタック時効果
  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );
    if (opponentUnits.length === 0) return;
    await System.show(stack, '天魔二断討', 'BP+2000\n1000ダメージ');
    Effect.modifyBP(stack, stack.processing, stack.processing, 2000, {
      source: { unit: stack.processing.id, effectCode: '天魔二断討' },
      event: 'turnEnd',
      count: 1,
    });
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      opponentUnits,
      '1000ダメージを与えるユニットを選択',
      1
    );
    Effect.damage(stack, stack.processing, target, 1000);
  },

  // プレイヤーアタック成功時効果
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>) => {
    if (!stack.processing.hasKeyword('貫通')) {
      await System.show(stack, 'ダイロク天魔剣', '【貫通】を付与\n行動権を回復');
      Effect.keyword(stack, stack.processing, stack.processing, '貫通');
      Effect.activate(stack, stack.processing, stack.processing, true);
    }
  },
};
