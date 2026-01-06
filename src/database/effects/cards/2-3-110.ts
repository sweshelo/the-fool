import { Card, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■スクラップ・ポリッシュ
  // このユニットがフィールドに出た時、あなたの捨札または消滅しているトリガーカードを2枚までランダムで手札に加える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 捨札と消滅しているトリガーカードを取得
    const trashTriggers = owner.trash.filter(card => card.catalog.type === 'trigger');
    const deletedTriggers = owner.delete.filter(card => card.catalog.type === 'trigger');

    // 回収対象となるカードをマージ
    const triggers: Card[] = [...trashTriggers, ...deletedTriggers];

    if (triggers_selectable) {
      await System.show(stack, 'スクラップ・ポリッシュ', '捨札と消滅からトリガーカードを2枚回収');

      // ランダムに最大2枚選出
      EffectHelper.random(triggers, 2).forEach(card =>
        Effect.move(stack, stack.processing, card, 'hand')
      );
    }
  },

  // ■アージェント・アンガー
  // このユニットがオーバークロックした時、対戦相手のユニットを1体選ぶ。それを対戦相手のデッキに戻す。
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const filter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    if (candidate_selectable) {
      await System.show(stack, 'アージェント・アンガー', 'デッキに戻す');

      try {
        // 対戦相手のユニットを選択
        const [selected] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          'アージェント・アンガー'
        );

        // 選択されたユニットをデッキに戻す
        Effect.bounce(stack, stack.processing, selected, 'deck');
      } catch (error) {
        console.error('ユニット選択エラー:', error);
      }
    }
  },
};
