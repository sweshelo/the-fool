import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    if (!EffectHelper.isVirusInjectable(stack.processing.owner.opponent)) return;
    await System.show(stack, 'フォース＜ウィルス・蝕＞', '＜ウィルス・蝕＞を【特殊召喚】');
    await EffectTemplate.virusInject(stack, stack.processing.owner.opponent, '＜ウィルス・蝕＞');
  },
  onTurnEnd: async (stack: StackWithCard) => {
    const targets = stack.processing.owner.deck.filter(card => card.catalog.type === 'intercept');
    if (
      stack.source.id !== stack.processing.owner.id ||
      stack.processing.owner.hand.length >= stack.core.room.rule.player.max.hand ||
      (stack.processing.owner.purple ?? 0) < 3 ||
      targets.length === 0
    )
      return;

    await System.show(
      stack,
      'マルブリッサの神術',
      'インターセプトカードを1枚引きレベル+1\n紫ゲージ-1'
    );
    EffectHelper.random(targets).forEach(card => {
      Effect.move(stack, stack.processing, card, 'hand');
      Effect.clock(stack, stack.processing, card, 1);
    });
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, -1);
  },
};
