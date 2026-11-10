import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // 手札の緑属性ユニットのコストを-1する
  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns', 'hand'],
      effect: (target, source) => Effect.modifyCost(target, -1, { source }),
      condition: target =>
        target.catalog.color === Color.GREEN &&
        (target.catalog.type === 'advanced_unit' || target.catalog.type === 'unit') &&
        stack.processing.owner.id === stack.core.getTurnPlayer().id &&
        !EffectHelper.combo(stack.core, stack.processing, {
          action: 'drive',
          type: ['unit', 'advanced_unit'],
        }),
      effectCode: '安心をあなたに',
    });
  },

  // メロンソーラー♪ - ユニット召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const discard = async () => {
      // 手札を選択
      const [card] = await EffectHelper.selectCard(
        stack,
        owner,
        owner.hand,
        '捨てるカードを選択して下さい'
      );

      // カードを捨てる
      Effect.break(stack, stack.processing, card);
    };

    await EffectHelper.combine(stack, [
      {
        title: 'メロンソーラー♪',
        description: '手札を1枚選んで捨てる',
        effect: discard,
        condition: stack.processing.lv === 1,
      },
      {
        title: 'メロンソーラー♪',
        description: 'カードを1枚引く',
        effect: () => {
          EffectTemplate.draw(owner, stack.core);
        },
      },
      { title: '安心をあなたに', description: '手札の緑属性のコスト-1', effect: () => {} },
    ]);
  },
};
