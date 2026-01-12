import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 召喚時に【神託】を付与
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '神託', '奇跡を発動すると【神託】は取り除かれる');
    Effect.keyword(stack, stack.processing, stack.processing, '神託');
  },

  // アタック時に【神託】がある場合、「ブロックされない」効果を付与し、【神託】を除去
  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    if (!stack.processing.hasKeyword('神託')) return;

    await System.show(stack, '奇跡・ひとくち頂戴！', '【次元干渉】を付与\n【神託】を除去');
    Effect.keyword(stack, stack.processing, stack.processing, '次元干渉', {
      event: '_postBattle',
      count: 1,
    });
    Effect.removeKeyword(stack, stack.processing, '神託');
  },

  // プレイヤーアタック成功時に相手ユニットの行動権を消費
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>) => {
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) return;

    await System.show(stack, '食欲旺盛', '行動権消費');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '行動権を消費するユニットを選んでください'
    );

    if (!target) return;

    Effect.activate(stack, stack.processing, target, false);
  },

  // ターン終了時に相手の捨札から3枚をランダムで消滅
  onTurnEnd: async (stack: StackWithCard<Unit>) => {
    const opponent = stack.processing.owner.opponent;
    if (opponent.trash.length === 0) return;

    await System.show(stack, '食欲旺盛', '捨札から3枚消滅');
    EffectHelper.random(opponent.trash, 3).forEach(card => {
      Effect.move(stack, stack.processing, card, 'delete');
    });
  },
};
