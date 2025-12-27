import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // ■起動・ニュードチャージ
  // このユニット以外のあなたのユニットを1体選ぶ。それを手札に戻し、あなたのCPを+1する。このユニットの基本BPを+1000する。
  isBootable: (core: Core, self: Unit): boolean => {
    // このユニット以外の自分のユニットが存在するかチェック
    return self.owner.field.some(unit => unit.id !== self.id);
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // このユニット以外の自分のユニットをフィルタリング
    const targets = stack.processing.owner.field.filter(unit => unit.id !== stack.processing.id);

    if (targets.length > 0) {
      await System.show(stack, 'ニュードチャージ', 'ユニットを手札に戻す\nCP+1\n自身のBP+1000');

      try {
        // ユニットを選択
        const [selected] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          targets,
          'ニュードチャージ'
        );

        // 選んだユニットを手札に戻す
        Effect.bounce(stack, stack.processing, selected);

        // CPを+1する
        Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);

        // 自身の基本BPを+1000する
        Effect.modifyBP(stack, stack.processing, stack.processing, 1000, { isBaseBP: true });
      } catch (error) {
        console.error('ユニット選択エラー:', error);
      }
    }
  },

  // ■ウィーゼル・ディソーダー
  // このユニットがフィールドに出た時、対戦相手の全てのユニットの基本BPを-1000する。
  // あなたのフィールドのユニットが4体以下の場合、あなたのデッキから進化ユニット以外のコスト3のユニットを1体ランダムで【特殊召喚】する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    const opponentUnits = opponent.field;

    // 対戦相手のユニットがいるかチェック
    let message: string = '';

    if (opponentUnits.length > 0) message += '敵全体の基本BP-1000';
    if (stack.processing.owner.field.length <= 4) message += 'コスト3ユニットを【特殊召喚】';

    if (message === '') return;

    await System.show(stack, 'ウィーゼル・ディソーダー', message);

    // 対戦相手の全てのユニットの基本BPを-1000する
    opponentUnits.forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, -1000, { isBaseBP: true });
    });

    // あなたのフィールドのユニットが4体以下の場合、特殊召喚
    if (stack.processing.owner.field.length <= 4) {
      // デッキから進化ユニット以外のコスト3のユニットをフィルタリング
      const summonTargets = stack.processing.owner.deck.filter(
        card => card instanceof Unit && !(card instanceof Evolve) && card.catalog.cost === 3
      );

      if (summonTargets.length > 0) {
        // ランダムで1体選択
        const [target] = EffectHelper.random(summonTargets);

        if (target instanceof Unit) {
          // 特殊召喚
          await Effect.summon(stack, stack.processing, target);
        }
      }
    }
  },
};
