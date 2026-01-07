import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ターン開始時効果
  onTurnStart: async (stack: StackWithCard<Unit>) => {
    const units = EffectHelper.candidate(stack.core, () => true, stack.processing.owner);
    if (units.length === 0) return;
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      units,
      'レベルを+1するユニットを選択',
      1
    );
    await System.show(stack, 'クロック・コントロール', 'レベル+1');
    Effect.clock(stack, stack.processing, target, 1);
  },

  // クロックアップ時効果
  onOverclockSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'クロック・コントロール', '進化ユニットカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['advanced_unit'] });
  },

  // レベル2の時に【加護】を与える
  fieldEffect: (stack: StackWithCard<Unit>) => {
    // Lv2で加護がない場合: 加護を付与
    if (
      stack.processing.lv === 2 &&
      !stack.processing.delta.find(delta => delta.source?.unit === stack.processing.id)
    ) {
      Effect.keyword(stack, stack.processing, stack.processing, '加護');
    }

    // Lv2以外で自分の効果による加護がある場合: 加護を除去
    if (
      stack.processing.lv !== 2 &&
      stack.processing.delta.find(delta => delta.source?.unit === stack.processing.id)
    ) {
      stack.processing.delta = stack.processing.delta.filter(
        delta => delta.source?.unit !== stack.processing.id
      );
    }
  },

  // プレイヤーアタック時効果
  onPlayerAttack: async (stack: StackWithCard<Unit>) => {
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id && unit.lv >= 2,
      stack.processing.owner
    );
    if (opponentUnits.length === 0) return;
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      opponentUnits,
      '破壊するユニットを選択',
      1
    );
    await System.show(stack, '信仰の歪み', 'ユニットを破壊\n紫ゲージ+1');
    Effect.break(stack, stack.processing, target, 'effect');
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  },
};
