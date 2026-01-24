import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたはカードを1枚引き、コストを-2する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '北斗玄天',
      '【固着】\n四聖獣ユニットに【秩序の盾】を付与\nカードを1枚引きコスト-2'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '固着');

    // カードを1枚引く
    const card = EffectTemplate.draw(stack.processing.owner, stack.core);
    if (card) {
      card.delta.push(new Delta({ type: 'cost', value: -2 }));
    }
  },

  // あなたの【四聖獣】ユニットに【秩序の盾】を与える（フィールド効果）
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // 自分の四聖獣ユニットを取得
    const fourGodUnits = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('四聖獣')
    );

    // 各四聖獣ユニットに【秩序の盾】を付与
    for (const unit of fourGodUnits) {
      // このカードから既に付与された【秩序の盾】があるか確認
      const orderShieldDelta = unit.delta.find(
        delta =>
          delta.source?.unit === stack.processing.id &&
          delta.source.effectCode === '秩序の盾' &&
          delta.effect.type === 'keyword' &&
          delta.effect.name === '秩序の盾'
      );

      // まだ付与されていない場合は付与する
      if (!orderShieldDelta) {
        Effect.keyword(stack, stack.processing, unit, '秩序の盾', {
          source: { unit: stack.processing.id, effectCode: '秩序の盾' },
        });
      }
    }
  },

  // あなたの【四聖獣】が戦闘で勝利した時、あなたのデッキからコスト4以下の【四聖獣】をランダムで1体【特殊召喚】する。
  onWin: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 戦闘で勝利した自分の【四聖獣】ユニットかどうか確認
    if (
      stack.target &&
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.species?.includes('四聖獣') &&
      stack.processing.owner.field.length < stack.core.room.rule.player.max.field
    ) {
      await System.show(stack, '翠檄黒叡智', 'デッキからコスト4以下の【四聖獣】を【特殊召喚】');

      // デッキからコスト4以下の【四聖獣】ユニットを抽出
      const fourGodUnits = stack.processing.owner.deck.filter(
        card =>
          card instanceof Unit && card.catalog.species?.includes('四聖獣') && card.catalog.cost <= 4
      );

      if (fourGodUnits.length > 0 && stack.processing.owner.field.length < 5) {
        // ランダムで1体選択
        const [randomUnit] = EffectHelper.random(fourGodUnits);

        // 特殊召喚
        if (randomUnit instanceof Unit) {
          await Effect.summon(stack, stack.processing, randomUnit);
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
