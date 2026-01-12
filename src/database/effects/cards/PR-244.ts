import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■時の神クロノス
  // あなたのターン終了時、あなたのジョーカーゲージを10%増加させる。
  checkTurnEnd: (stack: StackWithCard): boolean => {
    return stack.processing.owner.id === stack.core.getTurnPlayer().id;
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '時の神クロノス', 'ジョーカーゲージ+10%');
    Effect.modifyJokerGauge(stack, stack.processing, owner, 10);
  },

  // あなたのユニットがフィールドに出た時、ラウンド数が5以上で、
  // あなたのジョーカーゲージが50%以上ある場合、
  // あなたのジョーカーゲージを50%減少させる。あなたはカードを2枚引く。
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.core.round >= 5 &&
      stack.processing.owner.joker.gauge >= 50
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '時の神クロノス', 'ジョーカーゲージ-50%\nカードを2枚引く');

    // ジョーカーゲージを50%減少させる
    Effect.modifyJokerGauge(stack, stack.processing, owner, -50);

    // カードを2枚引く
    [...Array(2)].forEach(() => EffectTemplate.draw(owner, stack.core));
  },

  // あなたのターン開始時、ラウンド数が10で、あなたのジョーカーゲージが100%ある場合、
  // あなたは対戦に勝利する。
  checkTurnStart: (stack: StackWithCard): boolean => {
    return (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      stack.core.round === 10 &&
      stack.processing.owner.joker.gauge >= 100
    );
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, '時の神クロノス', '対戦に勝利する');

    // 対戦に勝利する（相手のライフを0にする）
    Effect.modifyLife(stack, stack.processing, opponent, -opponent.life.current);
  },
};
