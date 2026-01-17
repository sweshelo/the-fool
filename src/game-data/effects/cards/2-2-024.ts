import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Core } from '@/package/core';

const getExceptSelfOwnUnitsFilter = (self: Unit) => (unit: Unit) => {
  return unit.id !== self.id && unit.owner.id === self.owner.id;
};

export const effects: CardEffects = {
  // ■起動・ニュードチャージ
  // このユニット以外のあなたのユニットを1体選ぶ。それを手札に戻し、あなたのCPを+1する。このユニットの基本BPを+1000する。
  isBootable: (core: Core, self: Unit): boolean => {
    // このユニット以外の自分のユニットが存在するかチェック
    return EffectHelper.isUnitSelectable(core, getExceptSelfOwnUnitsFilter(self), self.owner);
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'ニュードチャージ', 'ユニットを手札に戻す\nCP+1\n自身のBP+1000');
    // ユニットを選択
    const [selected] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      getExceptSelfOwnUnitsFilter(stack.processing),
      'ニュードチャージ'
    );

    // 選んだユニットを手札に戻す
    Effect.bounce(stack, stack.processing, selected);

    // CPを+1する
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 1);

    // 自身の基本BPを+1000する
    Effect.modifyBP(stack, stack.processing, stack.processing, 1000, { isBaseBP: true });
  },

  // ■ウィーゼル・ディソーダー
  // このユニットがフィールドに出た時、対戦相手の全てのユニットの基本BPを-1000する。
  // あなたのフィールドのユニットが4体以下の場合、あなたのデッキから進化ユニット以外のコスト3のユニットを1体ランダムで【特殊召喚】する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    const opponentUnits = opponent.field;

    // 対戦相手のユニットがいるかチェック
    const message: string[] = [];

    if (opponentUnits.length > 0) message.push('敵全体の基本BP-1000');
    if (stack.processing.owner.field.length <= 4) message.push('コスト3ユニットを【特殊召喚】');

    if (message.length === 0) return;

    await System.show(stack, 'ウィーゼル・ディソーダー', message.join('\n'));

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
