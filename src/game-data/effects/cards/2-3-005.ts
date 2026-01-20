import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import master from '@/submodule/suit/catalog/catalog';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, 'ヘスティアのハピネスクッキング♪', '4000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択して下さい',
        1
      );
      Effect.damage(stack, stack.processing, target, 4000, 'effect');
    }
  },

  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分の効果で破壊されたかチェック
    if (
      stack.source.id !== stack.processing.id ||
      stack.option?.type !== 'break' ||
      stack.option.cause !== 'damage'
    )
      return;

    // 2回目の効果が発動しているかチェック
    const effect2activated = stack.processing.delta.some(
      delta =>
        delta.source?.unit === stack.processing.id &&
        delta.source.effectCode === 'ハピネスクッキング_2回目'
    );
    // 3回目の効果が発動しているかチェック
    const effect3activated = stack.processing.delta.some(
      delta =>
        delta.source?.unit === stack.processing.id &&
        delta.source.effectCode === 'ハピネスクッキング_3回目'
    );

    // 単体3000ダメージの効果
    // 既に発動済み、または選択対象がない場合は発動しない
    const filter = (unit: Unit) =>
      unit.destination !== 'trash' && unit.owner.id !== stack.processing.owner.id;
    if (
      !effect2activated &&
      EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
    ) {
      await System.show(stack, 'ヘスティアのハピネスクッキング♪', '3000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'ダメージを与えるユニットを選択して下さい',
        1
      );
      Effect.damage(stack, stack.processing, target, 3000, 'effect');
      stack.processing.delta.push(
        new Delta(
          { type: 'banned' },
          { source: { unit: stack.processing.id, effectCode: 'ハピネスクッキング_2回目' } }
        )
      );
    }

    // 全体2000ダメージの効果
    // 既に発動済み、または敵ユニットがいない場合は発動しない
    if (effect2activated && !effect3activated && stack.processing.owner.opponent.field.length > 0) {
      await System.show(stack, 'ヘスティアのハピネスクッキング♪', '2000ダメージ');
      stack.processing.owner.opponent.field.forEach(unit =>
        Effect.damage(stack, stack.processing, unit, 2000, 'effect')
      );
      stack.processing.delta.push(
        new Delta(
          { type: 'banned' },
          { source: { unit: stack.processing.id, effectCode: 'ハピネスクッキング_3回目' } }
        )
      );
    }
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    // 自分のターン終了時のみ発動
    if (stack.processing.owner.id !== stack.core.getTurnPlayer().id) return;

    if (stack.processing.owner.hand.length < stack.core.room.rule.player.max.hand) {
      await System.show(stack, '笑顔のハートフルキッチン♪', 'ランダムな【魔導士】を1枚作成');
      const [target] = EffectHelper.random(
        Array.from(master.values()).filter(catalog => catalog.species?.includes('魔導士'))
      );

      if (target) Effect.make(stack, stack.processing.owner, target.id);
    }
  },
};
