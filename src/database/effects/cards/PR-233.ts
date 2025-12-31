import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  // インターセプト: あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    return stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
  },

  onDrive: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '四神の理', '【四聖獣】を1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '四聖獣' });
  },

  // インターセプト: 対戦相手のターン終了時
  checkTurnEnd: (stack: StackWithCard<Card>): boolean => {
    const hasBlackKoryu = stack.processing.owner.field.some(
      unit => unit.catalog.name === 'ブラック黄龍'
    );
    return stack.source.id === stack.processing.owner.opponent.id && hasBlackKoryu;
  },

  onTurnEnd: async (stack: StackWithCard<Card>): Promise<void> => {
    const unitsInTrash = stack.processing.owner.trash.filter(
      card => card instanceof Unit && card.catalog.cost <= 7
    );

    if (unitsInTrash.length > 0) {
      await System.show(stack, '四神の理', 'コスト7以下を【特殊召喚】');

      const [target] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        unitsInTrash,
        '特殊召喚するユニットを選択',
        1
      );

      if (target instanceof Unit) {
        await Effect.summon(stack, stack.processing, target);
      }
    }
  },
};
