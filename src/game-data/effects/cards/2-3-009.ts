import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■選略・ヴァイス・オア・シュヴァルツ
  // このユニットがフィールドに出た時、以下の効果から1つを選び発動する。
  // ①：対戦相手のコスト2以下のユニットからランダムで2体まで手札に戻す。
  // ②：あなたの全てのユニットの【沈黙】を取り除く。
  async onDriveSelf(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // ①候補: 相手コスト2以下ユニット
    const cost2OrLess = opponent.field.filter(unit => unit.catalog.cost <= 2);
    // ②候補: 自分の【沈黙】持ちユニット
    const silencedUnits = owner.field.filter(unit => unit.hasKeyword && unit.hasKeyword('沈黙'));

    const choice = await EffectHelper.choice(stack, owner, '選略・ヴァイス・オア・シュヴァルツ', [
      {
        id: '1',
        description: 'ランダムで2体まで手札に戻す',
        condition: cost2OrLess.length > 0,
      },
      {
        id: '2',
        description: '【沈黙】を除去',
        condition: silencedUnits.length > 0,
      },
    ]);

    if (!choice) return;

    if (choice === '1') {
      // ①: ランダムで2体まで手札に戻す
      const targets = EffectHelper.random(cost2OrLess, 2);
      if (targets.length > 0) {
        await System.show(stack, 'ヴァイス・オア・シュヴァルツ', '手札に戻す');
        for (const unit of targets) {
          Effect.bounce(stack, stack.processing, unit, 'hand');
        }
      }
    } else if (choice === '2') {
      // ②: 自分の全ユニットの【沈黙】を除去
      await System.show(stack, 'ヴァイス・オア・シュヴァルツ', '【沈黙】を除去');
      for (const unit of silencedUnits) {
        if (unit.delta) {
          unit.delta = unit.delta.filter(
            delta => !(delta.effect.type === 'keyword' && delta.effect.name === '沈黙')
          );
        }
      }
    }
  },

  // ■次元的アルゴリズム
  // あなたのターン終了時、あなたのデッキからカードをランダムで3枚消滅させる。
  async onTurnEnd(stack: StackWithCard<Unit>) {
    // 自分のターン終了時かチェック
    if (stack.source !== stack.processing.owner) return;

    const owner = stack.processing.owner;
    const deck = owner.deck;
    if (deck.length > 0) {
      const targets = EffectHelper.random(deck, Math.min(3, deck.length));
      if (targets.length > 0) {
        await System.show(stack, '次元的アルゴリズム', 'デッキからランダムで3枚消滅');
        for (const card of targets) {
          Effect.move(stack, stack.processing, card, 'delete');
        }
      }
    }
  },
};
