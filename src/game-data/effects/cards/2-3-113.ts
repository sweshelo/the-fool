import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■びっくりさせちゃえ！
  // このユニットがフィールドに出た時、対戦相手のユニットを1体選ぶ。それを消滅させ、
  // そのユニットと同名のカードを対戦相手の手札、捨札、デッキから全て消滅させる。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(
        stack,
        'びっくりさせちゃえ！',
        'ユニットを1体消滅\n同名カードを手札・捨札・デッキから消滅'
      );

      // 対戦相手のユニットを選択
      const [selected] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'びっくりさせちゃえ！'
      );

      // 選択されたユニットの名前を取得
      const selectedName = selected.catalog.name;

      // 選択されたユニットを消滅
      Effect.delete(stack, stack.processing, selected);

      // 同名カードを対戦相手の手札、捨札、デッキから全て消滅させる
      [...opponent.hand, ...opponent.trash, ...opponent.deck].forEach(card => {
        if (card.catalog.name === selectedName) {
          Effect.delete(stack, stack.processing, card);
        }
      });
    }
  },

  // ■おおきくなるよ！
  // このユニットがブロックした時、ターン終了時までこのユニットのBPを2倍にする。
  onBlockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'おおきくなるよ！', 'ターン終了時までBPを2倍');

    // 現在のBPを取得
    const currentBP = stack.processing.currentBP;

    // ターン終了時までBPを2倍にする
    // BP差分のdeltaとして適用
    Effect.modifyBP(stack, stack.processing, stack.processing, currentBP, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
