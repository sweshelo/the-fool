import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Core } from '@/package/core';
import { error as logError } from '@/package/console-logger';

export const effects: CardEffects = {
  // ■起動・カムランの決戦
  // あなたのCPを-1する。そうした場合、対戦相手のユニットを1体選ぶ。それに【強制防御】を与える。
  // （この効果は1ターンに1度発動できる）
  isBootable: (core: Core, self: Unit): boolean => {
    // CPが1以上あるか確認
    const hasSufficientCP = self.owner.cp.current >= 1;
    return hasSufficientCP && EffectHelper.isUnitSelectable(core, 'opponents', self.owner);
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のユニットが存在するか確認
    if (opponent.field.length > 0) {
      await System.show(stack, 'カムランの決戦', 'CP-1\n敵ユニット1体に【強制防御】');

      try {
        // 対戦相手のユニットを選択
        const [selected] = await EffectHelper.pickUnit(
          stack,
          owner,
          'opponents',
          '【強制防御】を与えるユニットを選択して下さい'
        );

        // 選んだユニットに【強制防御】を与える
        Effect.keyword(stack, stack.processing, selected, '強制防御');
        // CPを-1する
        Effect.modifyCP(stack, stack.processing, owner, -1);
      } catch (error) {
        logError('CardEffect', 'ユニット選択エラー:', error);
      }
    }
  },

  // ■緋翠のクラレント
  // このユニットがフィールドに出た時、あなたの捨札のカードを全てデッキに戻す。
  // そうした場合、あなたの【英雄】ユニットの基本BPを+［デッキに戻した枚数×500］する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const trashCards = [...owner.trash]; // コピーを作成して操作

    if (trashCards.length > 0) {
      await System.show(
        stack,
        '緋翠のクラレント＆貫通',
        `捨札を全てデッキに戻す\n【英雄】ユニットのBP+[戻したカードの枚数×500]`
      );

      // 捨札のカードを全てデッキに戻す
      trashCards.forEach(card => {
        Effect.move(stack, stack.processing, card, 'deck');
      });

      // 【英雄】ユニットの基本BPを増加
      const heroUnits = owner.field.filter(
        unit =>
          unit.catalog.species &&
          Array.isArray(unit.catalog.species) &&
          unit.catalog.species.includes('英雄')
      );

      const bpIncrease = trashCards.length * 500;

      heroUnits.forEach(unit => {
        Effect.modifyBP(stack, stack.processing, unit, bpIncrease, { isBaseBP: true });
      });
    } else {
      await System.show(stack, '貫通', 'ブロックを貫通してプレイヤーにダメージを与える');
    }

    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
  },
};
