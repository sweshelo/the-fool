import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■森の女神 - インターセプトカード
  // あなたのユニットが戦闘した時、ターン終了時までそれのBPを+2000する。
  // あなたのユニットが戦闘で勝利した時、あなたはカードを1枚引く。あなたのCPを+1する。
  // あなたがプレイヤーアタックを受けた時、プレイヤーアタックしたユニットの基本BPを-3000する。

  // 味方ユニットが戦闘した時のインターセプト効果
  onBattle: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のユニットが戦闘した時のみ発動
    if (stack.source instanceof Unit && stack.source.owner.id === owner.id) {
      await System.show(stack, '森の女神', 'BP+2000');

      // BP+2000（ターン終了時まで）
      Effect.modifyBP(stack, stack.processing, stack.source, 2000, {
        event: 'turnEnd',
        count: 1,
      });
    }
  },

  // 戦闘で勝利した時のインターセプト効果
  onWinSelf: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のユニットが戦闘で勝利した時のみ発動
    if (stack.source instanceof Unit && stack.source.owner.id === owner.id) {
      await System.show(stack, '森の女神', 'カードを1枚引く\nCP+1');

      // カードを1枚引く
      EffectTemplate.draw(owner, stack.core);

      // CPを+1する
      Effect.modifyCP(stack, stack.processing, owner, 1);
    }
  },

  // プレイヤーアタックを受けた時のインターセプト効果
  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分がプレイヤーアタックを受けた時のみ発動
    if (
      stack.source instanceof Unit &&
      stack.source.owner.id !== owner.id && // 相手のユニット
      stack.target?.id === owner.id // 自分がターゲット
    ) {
      await System.show(stack, '森の女神', '敵ユニットの基本BPを-3000');

      // プレイヤーアタックしたユニットの基本BPを-3000する
      Effect.modifyBP(stack, stack.processing, stack.source, -3000, {
        isBaseBP: true,
      });
    }
  },

  // インターセプトカード効果の発動チェック：戦闘時
  checkBattle: async (stack: StackWithCard): Promise<boolean> => {
    const owner = stack.processing.owner;

    // 自分のユニットが戦闘した時のみ発動可能
    return stack.source instanceof Unit && stack.source.owner.id === owner.id;
  },

  // インターセプトカード効果の発動チェック：戦闘勝利時
  checkWin: async (stack: StackWithCard): Promise<boolean> => {
    const owner = stack.processing.owner;

    // 自分のユニットが戦闘で勝利した時のみ発動可能
    return stack.source instanceof Unit && stack.source.owner.id === owner.id;
  },

  // インターセプトカード効果の発動チェック：プレイヤーアタック時
  checkPlayerAttack: async (stack: StackWithCard): Promise<boolean> => {
    const owner = stack.processing.owner;

    // 自分がプレイヤーアタックを受けた時のみ発動可能
    return (
      stack.source instanceof Unit &&
      stack.source.owner.id !== owner.id && // 相手のユニット
      stack.target?.id === owner.id // 自分がターゲット
    );
  },
};
