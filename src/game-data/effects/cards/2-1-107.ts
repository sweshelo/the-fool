import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

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

    const [selectedChoice] = await System.prompt(stack, opponent.id, {
      type: 'option',
      title: '選告・ラピッドラビット',
      items: [
        { id: '1', description: 'ユニットに【加護】と【破壊効果耐性】を与える' },
        { id: '2', description: 'トリガーカードを2枚引く' },
      ],
    });

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
    const owner = stack.processing.owner;

    // 自分の天使ユニットを対象にする
    owner.field.forEach(unit => {
      // 天使ユニットか確認
      if (unit.catalog.species?.includes('天使')) {
        // 既にこのユニットが発行したDeltaが存在するか確認
        const delta = unit.delta.find(
          d => d.source?.unit === stack.processing.id && d.source?.effectCode === 'サポーター／天使'
        );

        if (delta && delta.effect.type === 'bp') {
          // 既存のDeltaを更新
          delta.effect.diff = 1000;
        } else {
          // 新しいDeltaを発行
          Effect.modifyBP(stack, stack.processing, unit, 1000, {
            source: { unit: stack.processing.id, effectCode: 'サポーター／天使' },
          });
        }
      } else {
        // 天使でなくなった場合、このユニットが付与したBP上昇を削除
        unit.delta = unit.delta.filter(
          d =>
            !(d.source?.unit === stack.processing.id && d.source?.effectCode === 'サポーター／天使')
        );
      }
    });
  },
};
