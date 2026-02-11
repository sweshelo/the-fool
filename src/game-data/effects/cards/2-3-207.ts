import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、【四聖獣】ユニットを1枚引く。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '昊天勁威', '【四聖獣】ユニットを1枚引く');

    // 【四聖獣】ユニットを1枚引く
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '四聖獣' });
  },

  // このユニットが破壊された時、あなたはトリガーカードを1枚引く。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '白撃黒武爪', 'トリガーカードを1枚引く');

    // トリガーカードを1枚引く
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
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
      const [target] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        fourGodUnits,
        '捨てる【四聖獣】ユニットを選択してください'
      );
      Effect.move(stack, stack.processing, target, 'trash');
    }
  },
};
