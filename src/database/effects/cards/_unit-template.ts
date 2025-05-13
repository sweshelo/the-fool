import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';

// 共通処理は別関数に切り出すとよい。
const subEffect = async (stack: StackWithCard<Unit>) => {
  await System.show(stack, '効果II', 'インターセプトカードとトリガーカードを1枚ずつ引く');
  EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
};

export const effects: CardEffects = {
  // 【秩序の盾】(発動タイミングが明記されていないキーワード効果は、召喚時に付与される)
  // フィールド効果を持つ場合は、それが発動するとどういう効果を発揮するかも表示する
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '効果III＆秩序の盾',
      'BP+3000\n【不滅】を得る\n対戦相手の効果によってダメージを受けない'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
  },

  // このユニットが破壊または消滅した時、あなたはトリガーカードとインターセプトカードを1枚ずつ引く
  onBreakSelf: subEffect,
  onDeleteSelf: subEffect,

  // あなたのターン終了時、それが偶数ラウンドの場合、お互いのユニットを1体ずつ選ぶ。それらを破壊する。
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    const oppTargets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );
    const ownTargets = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
      stack.processing.owner
    );

    if (
      stack.processing.owner.id === stack.core.getTurnPlayer().id && // 自分のターン
      stack.core.round % 2 === 0 && // 偶数ラウンド
      oppTargets.length > 0 && // 相手のユニットを1体以上選択可能
      ownTargets.length > 0 // 自分のユニットを1体以上選択可能
    ) {
      await System.show(stack, '効果I', 'お互いのユニットを破壊');
      const [ownTarget] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        ownTargets,
        '破壊するユニットを選択して下さい',
        1
      );
      const [oppTarget] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        oppTargets,
        '破壊するユニットを選択して下さい',
        1
      );

      Effect.break(stack, stack.processing, ownTarget, 'effect');
      Effect.break(stack, stack.processing, oppTarget, 'effect');
    }
  },

  // あなたのライフが1以下の場合、このユニットに【不滅】を与え、BPを+3000する。
  fieldEffect: (stack: StackWithCard<Unit>) => {
    // NOTE: 必要な処理は以下
    // - ライフが1以下で効果を発動していない場合、発動する。
    // - ライフが1より大で効果を発動している場合、削除する。
    const immDelta = stack.processing.delta.find(
      delta => delta.source?.unit === stack.processing.id && delta.source.effectCode === '不滅'
    );
    const bpDelta = stack.processing.delta.find(
      delta => delta.source?.unit === stack.processing.id && delta.source.effectCode === 'BP'
    );

    if (stack.processing.owner.life.current <= 1) {
      // keyword/modifyBPの `{source: {unit: ...}}` は、どのユニットから受けた効果であるかを示し、フィールド効果の場合に用いる。
      // 他のユニットに対して指定しておくと、指定元のユニットがフィールドを離れた際に自動的に削除処理が実行される。
      if (!immDelta)
        Effect.keyword(stack, stack.processing, stack.processing, '不滅', {
          source: { unit: stack.processing.id, effectCode: '不滅' },
        });
      if (!bpDelta)
        Effect.modifyBP(stack, stack.processing, stack.processing, +3000, {
          source: { unit: stack.processing.id, effectCode: 'BP' },
        });
    } else {
      // 自分の効果で付与されたDeltaをフィルタする
      if (immDelta || bpDelta)
        stack.processing.delta = stack.processing.delta.filter(
          delta => delta.source?.unit !== stack.processing.id
        );
    }
  },

  // あなたのトリガーゾーンにあるカードを1枚ランダムで破壊する。そうした場合、デッキから1枚選び、トリガーゾーンにセットする。
  isBootable: (core: Core, self: Unit) => {
    return self.owner.trigger.length > 0 && self.owner.deck.length > 0;
  },

  onBootSelf: async (stack: StackWithCard) => {
    await System.show(stack, '起動・効果IV', 'トリガーゾーンを1枚破壊\nデッキから1枚選びセット');
    const [target] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      stack.processing.owner.deck,
      'トリガーゾーンにセットするカードを選択して下さい',
      1
    );
    EffectHelper.random(stack.processing.owner.trigger).forEach(card =>
      Effect.move(stack, stack.processing, card, 'trash')
    );
    Effect.move(stack, stack.processing, target, 'trigger');
  },
};
