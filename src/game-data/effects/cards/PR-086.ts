import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、このユニットに【秩序の盾】を付与する。
  // このターンにあなたがこのユニット以外のコスト2以上の緑属性のカードを使用している場合、このユニットの基本BPを+2000する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;

    // 連撃条件確認: このターンにコスト2以上の緑属性のカードを使用しているか
    const hasUsedGreenCardThisTurn = stack.core.histories.some(
      history =>
        history.card.owner.id === self.owner.id && // あなたのカード
        history.card.id !== self.id && // このユニット以外
        history.card.catalog.color === Color.GREEN && // 緑属性
        history.card.catalog.cost >= 2 // コスト2以上
    );

    // メッセージ構築と表示
    const effectName = hasUsedGreenCardThisTurn ? '連撃・碧き広野の繁栄' : '秩序の盾';
    const message = hasUsedGreenCardThisTurn
      ? '【秩序の盾】\n基本BP+2000'
      : '対戦相手の効果によるダメージを受けない';
    await System.show(stack, effectName, message);

    // 秩序の盾を付与
    Effect.keyword(stack, self, self, '秩序の盾');

    // 連撃条件を満たしている場合、基本BPを+2000
    if (hasUsedGreenCardThisTurn) {
      Effect.modifyBP(stack, self, self, 2000, { isBaseBP: true });
    }
  },

  // あなたのコスト4以上の緑属性ユニットがフィールドに出るたび、あなたはカードを1枚引く。
  onDrive: async (stack: StackWithCard<Card>): Promise<void> => {
    // 自分のコスト4以上の緑属性ユニットがフィールドに出た時のみ処理
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.color === Color.GREEN &&
      stack.target.catalog.cost >= 4
    ) {
      await System.show(stack, '麗しの碧い風', 'カードを1枚引く');
      EffectTemplate.draw(stack.processing.owner, stack.core);
    }
  },
};
