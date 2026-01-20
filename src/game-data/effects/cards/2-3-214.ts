import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、デッキから3枚見て1枚選んで手札に加えて残りは捨てる。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '蒼天練武', 'デッキから3枚見て1枚選び残りは捨てる');

    // デッキの上から3枚を取得
    const deckTop3 = stack.processing.owner.deck.slice(0, 3);

    if (deckTop3.length > 0) {
      // プレイヤーに選択を促す
      const [choice] = await System.prompt(stack, stack.processing.owner.id, {
        title: '手札に加えるカードを選択してください',
        type: 'card',
        items: deckTop3,
        count: 1,
      });

      // 選んだカードを手札に加え、残りを捨札に送る
      for (const card of deckTop3) {
        if (card.id === choice) {
          Effect.move(stack, stack.processing, card, 'hand');
        } else {
          Effect.move(stack, stack.processing, card, 'trash');
        }
      }
    }
  },

  // 自身以外のあなたの【四聖獣】がフィールドに出た時、このユニットのレベルを+1する。
  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分自身以外の四聖獣がフィールドに出た時
    if (
      stack.target &&
      stack.target instanceof Unit &&
      stack.target.id !== stack.processing.id &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.species?.includes('四聖獣')
    ) {
      await System.show(stack, '蒼麗黒槍雅', 'レベル+1');

      // レベルを+1する
      Effect.clock(stack, stack.processing, stack.processing, +1);
    }
  },

  // このユニットがクロックアップするたび、対戦相手のユニットからランダムで1体に【沈黙】とデスカウンター［1］を与える。
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のユニットがあるか確認
    const oppUnits = stack.processing.owner.opponent.field;

    if (oppUnits.length > 0) {
      await System.show(stack, '蒼麗黒槍雅', '敵ユニットに【沈黙】とデスカウンター付与');

      // ランダムで1体選択
      const randomUnits = EffectHelper.random(oppUnits, 1);

      if (randomUnits.length > 0) {
        const target = randomUnits[0];

        // targetが存在することを確認
        if (target) {
          // 【沈黙】を付与
          Effect.keyword(stack, stack.processing, target, '沈黙');

          // デスカウンター［1］を付与
          Effect.death(stack, stack.processing, target, 1);
        }
      }
    }
  },

  // 起動・四聖の殉国: デッキから【四聖獣】を1体選んで捨てる。
  isBootable: (core, self): boolean => {
    // デッキに【四聖獣】ユニットがあるかチェック
    return self.owner.deck.some(
      card => card instanceof Unit && card.catalog.species?.includes('四聖獣')
    );
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '起動・四聖の殉国', 'デッキから【四聖獣】を1体選んで捨てる');

    // デッキから【四聖獣】ユニットを抽出
    const fourGodUnits = stack.processing.owner.deck.filter(
      card => card instanceof Unit && card.catalog.species?.includes('四聖獣')
    );

    if (fourGodUnits.length > 0) {
      // プレイヤーに選択を促す
      const [choice] = await System.prompt(stack, stack.processing.owner.id, {
        title: '捨てる【四聖獣】ユニットを選択してください',
        type: 'card',
        items: fourGodUnits,
        count: 1,
      });

      // 選択したカードを捨札に送る
      const target = fourGodUnits.find(card => card.id === choice);
      if (target) {
        Effect.move(stack, stack.processing, target, 'trash');
      }
    }
  },
};
