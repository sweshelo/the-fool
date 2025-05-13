import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

// 三叉の炎舞の共通処理
const triggerDestroy = async (stack: StackWithCard<Unit>): Promise<void> => {
  const opponent = stack.processing.owner.opponent;

  if (opponent.trigger.length === 0) return;

  await System.show(stack, '三叉の炎舞', '相手のトリガーを破壊');

  // トリガーゾーンからランダムで1枚選ぶ
  const [targetCard] = EffectHelper.random(opponent.trigger, 1);
  if (targetCard) Effect.move(stack, stack.processing, targetCard, 'trash');
};

export const effects: CardEffects = {
  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await triggerDestroy(stack);
  },

  // ターン開始時の効果
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const turnPlayer = stack.core.getTurnPlayer();

    // 自分のターン開始時は常に発動
    if (owner.id === turnPlayer.id) {
      await triggerDestroy(stack);
      return;
    }

    // 相手のターン開始時は自分の武身が4体以上いる場合のみ発動
    const bushintaiCount = owner.field.filter(unit =>
      unit.catalog.species?.includes('武身')
    ).length;
    if (bushintaiCount >= 4) {
      await triggerDestroy(stack);
    }
  },

  // 相手ターン終了時の効果
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    await EffectTemplate.reincarnate(stack, stack.processing);
  },
};
