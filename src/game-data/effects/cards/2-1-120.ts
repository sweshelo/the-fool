import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Card, Unit } from '@/package/core/class/card';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // このカードがフィールドに出た時、フィールド効果の内容を表示
  async onDriveSelf(stack: StackWithCard<Unit>) {
    await System.show(
      stack,
      '転戦の天ノ河',
      '手札の【戦士】コスト-1\n【戦士】のBPを+[【戦士】数×500]'
    );
  },

  // ■転戦の天ノ河
  // あなたの手札の【戦士】ユニットのコストを-1する。
  // あなたの【戦士】ユニットのBPを+[あなたのフィールドにいる【戦士】×500]する。
  fieldEffect(stack: StackWithCard<Unit>) {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns', 'hand'],
      effect: (card, source) => Effect.modifyCost(card, -1, { source }),
      effectCode: '転戦の天ノ河',
      condition: card => card.catalog.species?.includes('戦士'),
    });

    const fighterCalculator = (self: Card) =>
      self.owner.field.filter(unit => unit.catalog.species?.includes('戦士')).length * 500;
    PermanentEffect.mount(stack.processing, {
      targets: ['owns'],
      effect: (unit, source) => {
        if (unit instanceof Unit)
          Effect.dynamicBP(stack, stack.processing, unit, fighterCalculator, { source });
      },
      effectCode: '転戦の天ノ河',
      condition: unit => unit.catalog.species?.includes('戦士'),
    });
  },

  // ■星華の導き
  // あなたの【戦士】ユニットがフィールドに出た時、それに【スピードムーブ】を与える。
  async onDrive(stack: StackWithCard) {
    // 召喚されたユニットが戦士タイプかつ自分の所有ユニットかチェック
    if (
      stack.target instanceof Unit &&
      stack.target.catalog.species?.includes('戦士') &&
      stack.target.owner.id === stack.processing.owner.id
    ) {
      await System.show(stack, '星華の導き', '【スピードムーブ】を与える');
      Effect.speedMove(stack, stack.target);
    }
  },

  // ■星輝の恩寵
  // あなたのユニットがプレイヤーアタックに成功した時、それのレベルを+1する。
  async onPlayerAttack(stack: StackWithCard) {
    // 自分のユニットがプレイヤーアタックに成功した時のみ発動
    if (stack.source instanceof Unit && stack.source.owner.id === stack.processing.owner.id) {
      await System.show(stack, '星輝の恩寵', 'レベル+1');
      Effect.clock(stack, stack.processing, stack.source, 1);
    }
  },
};
