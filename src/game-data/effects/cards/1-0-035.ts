import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.opponent.field.length > 0) {
      await System.show(stack, '闇の顕現', '【沈黙】を与える');
      EffectHelper.random(stack.processing.owner.opponent.field).forEach(unit =>
        Effect.keyword(stack, stack.processing, unit, '沈黙')
      );
    }
  },

  // このユニットがプレイヤーアタックに成功した時
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.trash.length <= 0) return;
    if (stack.processing.owner.hand.length < stack.core.room.rule.player.max.hand) {
      await System.show(stack, 'リバイブ', '捨札から1枚選んで回収');
      await EffectTemplate.revive(stack, 1);
    }
  },

  // このユニットが破壊された時
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '復興の嘶き', '【獣】ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '獣' });
  },
};
