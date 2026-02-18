import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットが戦闘した時、ターン終了時までそれのBPを+2000する。
  checkBattle: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 戦闘中の自ユニットを特定
    const ownUnit = [stack.source, stack.target].find(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );

    // ユニットが存在し、フィールドにまだいる場合のみ発動
    return !!ownUnit && owner.field.some(unit => unit.id === ownUnit.id);
  },

  // 味方ユニットが戦闘した時のインターセプト効果
  onBattle: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 戦闘中の自ユニットを特定
    const [target] = [stack.source, stack.target].filter(
      (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
    );

    if (!target) return;

    await System.show(stack, '森の女神', 'BP+2000');

    // BP+2000（ターン終了時まで）
    Effect.modifyBP(stack, stack.processing, target, 2000, {
      event: 'turnEnd',
      count: 1,
    });
  },

  // あなたのユニットが戦闘で勝利した時、あなたはカードを1枚引く。あなたのCPを+1する。
  checkWin: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のユニットが戦闘で勝利した時のみ発動可能
    return stack.target instanceof Unit && stack.target.owner.id === owner.id;
  },

  // 戦闘で勝利した時のインターセプト効果
  onWin: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    await System.show(stack, '森の女神', 'カードを1枚引く\nCP+1');

    // カードを1枚引く
    EffectTemplate.draw(owner, stack.core);

    // CPを+1する
    Effect.modifyCP(stack, stack.processing, owner, 1);
  },

  // あなたがプレイヤーアタックを受けた時、プレイヤーアタックしたユニットの基本BPを-3000する。
  checkPlayerAttack: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const attacker = stack.source;

    // 自分がプレイヤーアタックを受けた時のみ発動可能
    if (!(attacker instanceof Unit)) return false;
    if (stack.target?.id !== owner.id) return false; // 自分が攻撃を受けていない

    // 相手のフィールドに攻撃ユニットが存在するか確認
    return attacker.owner.field.some(unit => unit.id === attacker.id);
  },

  // プレイヤーアタックを受けた時のインターセプト効果
  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    if (stack.source instanceof Unit) {
      await System.show(stack, '森の女神', '基本BP-3000');

      // プレイヤーアタックしたユニットの基本BPを-3000する
      Effect.modifyBP(stack, stack.processing, stack.source, -3000, {
        isBaseBP: true,
      });
    }
  },
};
