import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    if (
      EffectHelper.isVirusInjectable(stack.processing.owner) &&
      EffectHelper.isVirusInjectable(stack.processing.owner.opponent)
    ) {
      await System.show(
        stack,
        'Ｗフォース＜ウィルス・炎＞',
        'お互いのフィールドに＜ウィルス・炎＞を【特殊召喚】'
      );
      for (const player of [stack.processing.owner, stack.processing.owner.opponent]) {
        await EffectTemplate.virusInject(stack, player, 'ウィルス・炎');
      }
    }
  },
  onDamage: async (stack: StackWithCard) => {
    if (
      stack.core.getTurnPlayer().id !== stack.processing.owner.id &&
      stack.option?.type === 'damage' &&
      stack.option.cause === 'effect'
    ) {
      await System.show(stack, 'アヴェスタ―の残焔', '敵全体に2000ダメージ');
      stack.processing.owner.opponent.field.forEach(unit =>
        Effect.damage(stack, stack.processing, unit, 2000)
      );
    }
  },
};
