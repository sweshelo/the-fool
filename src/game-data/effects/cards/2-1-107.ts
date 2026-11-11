import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // ■選告・ラピッドラビット
  // このユニットがフィールドに出た時、対戦相手は以下の効果から1つを選び発動する。
  // ①：あなたのユニットからランダムで1体に【加護】と【破壊効果耐性】を与える。
  // ②：あなたはトリガーカードを2枚引く。
  // ■サポーター／天使
  // あなたの【天使】ユニットのBPを+1000する。

  // フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(
      stack,
      '選告・ラピッドラビット',
      '相手が選択：\n①ユニットに【加護】【破壊効果耐性】\n②トリガーカードを2枚引く\n【天使】のBPを+1000'
    );

    const selectedChoice = await EffectHelper.choice(stack, opponent, '選告・ラピッドラビット', [
      { id: '1', description: 'ユニットに【加護】と【破壊効果耐性】を与える' },
      { id: '2', description: 'トリガーカードを2枚引く' },
    ]);

    // 選択した効果を発動
    switch (selectedChoice) {
      case '1':
        // ①：ユニットからランダムで1体に【加護】と【破壊効果耐性】を与える
        if (owner.field.length > 0) {
          const [target] = EffectHelper.random(owner.field, 1);
          if (target) {
            // 効果表示
            await System.show(stack, '選告・ラピッドラビット', '【加護】と【破壊効果耐性】を付与');
            // 加護と破壊効果耐性を付与
            Effect.keyword(stack, stack.processing, target, '加護');
            Effect.keyword(stack, stack.processing, target, '破壊効果耐性');
          }
        }
        break;

      case '2':
        await System.show(stack, '選告・ラピッドラビット', 'トリガーカードを2枚引く');
        [...Array(2)].forEach(() =>
          EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] })
        );
        break;
    }

    await System.show(stack, 'サポーター／天使', '【天使】のBP+1000');
  },

  // フィールド効果：天使ユニットのBPを+1000する
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, target, 1000, { source });
        }
      },
      condition: target => target.catalog.species?.includes('天使'),
      effectCode: 'サポーター／天使',
      targets: ['owns'],
    });
  },
};
