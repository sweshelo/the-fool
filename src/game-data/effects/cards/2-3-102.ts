import { Unit } from '@/package/core/class/card';
import { Joker } from '@/package/core/class/card/Joker';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 【スピードムーブ】を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '棘忍のリゼ', '【スピードムーブ】');
    Effect.speedMove(stack, stack.processing);
  },

  // ■何度生まれ変わっても
  // あなたがジョーカーカードの効果を発動した時、このユニットの行動権を回復し、ターン終了時まで【貫通】を得る
  onJoker: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.target instanceof Joker && stack.target.owner.id === stack.processing.owner.id) {
      await System.show(stack, '何度生まれ変わっても', '行動権回復\n【貫通】付与');
      Effect.activate(stack, stack.processing, stack.processing, true);
      Effect.keyword(stack, stack.processing, stack.processing, '貫通', {
        event: 'turnEnd',
        count: 1,
      });
    }
  },

  // ■綺麗な薔薇には棘がある
  // このユニットがプレイヤーアタックに成功した時、
  // あなたのデッキから1枚ランダムであなたのトリガーゾーンにトリガーカードをセットする
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // トリガーゾーンに空きがあるか確認
    if (owner.trigger.length >= stack.core.room.rule.player.max.trigger) return;

    // デッキにトリガーカードがあるか確認
    const triggers = owner.deck.filter(card => card.catalog.type === 'trigger');
    if (triggers.length === 0) return;

    await System.show(stack, '綺麗な薔薇には棘がある', 'トリガーカードをセット');

    EffectHelper.random(triggers, 1).forEach(card =>
      Effect.move(stack, stack.processing, card, 'trigger')
    );
  },
};
