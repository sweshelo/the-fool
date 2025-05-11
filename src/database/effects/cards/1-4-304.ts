import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■選略・密偵勅命
  // あなたの【忍者】ユニットがアタックした時、以下の効果から1つを選び発動する。
  // ①：あなたは手札を1枚選んで捨てる。ターン終了時までアタックしたユニットに「ブロックされない」効果を与える。
  // ②：ターン終了時までアタックしたユニットのBPを+2000する。
  // ■曲者討伐
  // あなたのトリガーカードの効果が発動するたび、対戦相手のユニットを1体選ぶ。それに2000ダメージを与える。

  // 忍者ユニットがアタックした時の効果
  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分の忍者ユニットがアタックした時のみ発動
    if (
      stack.source instanceof Unit &&
      stack.source.owner.id === owner.id &&
      stack.source.catalog.species?.includes('忍者')
    ) {
      // 選択肢を提示
      const [choice] =
        stack.processing.owner.hand.length > 0
          ? await System.prompt(stack, owner.id, {
              type: 'option',
              title: '選略・密偵勅命',
              items: [
                { id: '1', description: '手札を1枚捨て、ブロックされない効果を得る' },
                { id: '2', description: 'BP+2000' },
              ],
            })
          : ['2'];

      // 選択した効果を発動
      switch (choice) {
        case '1':
          // ①：手札を1枚選んで捨て、ブロックされない効果を与える
          if (owner.hand.length > 0) {
            await System.show(stack, '選略・密偵勅命', '手札を1枚捨て、ブロックされない効果を付与');

            // 手札を1枚選ぶ
            const [selectedCard] = await EffectHelper.selectCard(
              stack,
              owner,
              owner.hand,
              '捨てるカードを選択',
              1
            );

            // 選んだカードを捨てる
            Effect.move(stack, stack.processing, selectedCard, 'trash');

            // ブロックされない効果を与える（次元干渉/コスト0として実装）
            Effect.keyword(stack, stack.processing, stack.source, '次元干渉', {
              event: 'turnEnd',
              count: 1,
              cost: 0,
            });
          }
          break;

        case '2':
          // ②：BP+2000
          await System.show(stack, '選略・密偵勅命', 'BP+2000');

          // BP+2000（ターン終了時まで）
          Effect.modifyBP(stack, stack.processing, stack.source, 2000, {
            event: 'turnEnd',
            count: 1,
          });
          break;
      }
    }
  },

  // トリガーカード効果発動時
  onTrigger: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のトリガーカードの効果が発動したときのみ処理
    // sourceがCardの場合のみ処理
    if ('owner' in stack.source && stack.source.owner.id === owner.id) {
      const opponent = owner.opponent;

      // 相手のユニットが存在する場合のみ処理
      if (opponent.field.length > 0) {
        // 対象を選択可能なユニットを取得
        const targetCandidates = EffectHelper.candidate(
          stack.core,
          unit => unit.owner.id === opponent.id,
          owner
        );

        if (targetCandidates.length > 0) {
          await System.show(stack, '曲者討伐', '敵に2000ダメージ');

          // ユニットを1体選択
          const [target] = await EffectHelper.selectUnit(
            stack,
            owner,
            targetCandidates,
            'ダメージを与えるユニットを選択'
          );

          // 2000ダメージを与える
          Effect.damage(stack, stack.processing, target, 2000);
        }
      }
    }
  },
};
