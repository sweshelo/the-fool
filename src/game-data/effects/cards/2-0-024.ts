import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(
      stack,
      '大地からの贈り物＆風の加護',
      '自分の手札を選んで捨てる\nコスト3のユニットを1枚引く\n【秩序の盾】を得る'
    );

    // 手札を選んで捨てる
    const owner = stack.processing.owner;
    const [target] = await EffectHelper.selectCard(
      stack,
      owner,
      owner.hand,
      '捨てるカードを選択してください'
    );
    Effect.break(stack, stack.processing, target);

    // コスト3のユニットを引く
    const [card] = EffectHelper.random(
      owner.deck.filter(card => card.catalog.cost === 3 && card instanceof Unit),
      1
    );
    if (card) Effect.move(stack, stack.processing, card, 'hand');
  },

  // 自身以外が召喚された時に発動する効果を記述
  // 味方ユニットであるかの判定などを忘れない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    // stack.target が自ユニットでない or stack.targetがコスト2以上のユニットでない or 比較対象が自分自身の場合は中断
    if (
      !(stack.target instanceof Unit) ||
      stack.target.catalog.cost < 2 ||
      stack.target.owner.id !== stack.processing.owner.id ||
      stack.target.id === stack.processing.id ||
      !stack.processing.owner.field.find(unit => unit.id == stack.target?.id)
    )
      return;

    // ユニットが生存していない場合は処理を中断する
    if (
      !stack.processing.owner.field.find(unit => unit.id === stack.processing.id) ||
      !EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    )
      return;

    await System.show(stack, '風のおしおき', 'お互いにBPダメージ');
    const [damageUnit] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      'ダメージを与えるユニットを選択して下さい'
    );

    const [damageA, damageB] = [stack.target.currentBP, damageUnit.currentBP];
    Effect.damage(stack, stack.processing, damageUnit, damageA, 'effect');
    Effect.damage(stack, stack.processing, stack.target, damageB, 'effect');
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    // 自身に秩序の盾を与える効果が発動しておらず、フィールドにユニットが２体以下の場合
    if (
      stack.processing.owner.field.length <= 2 &&
      !stack.processing.delta.some(delta => delta.source?.unit === stack.processing.id)
    ) {
      Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾', {
        source: {
          unit: stack.processing.id,
        },
      });
    }

    // 自身に秩序の盾を与える効果が発動しており、フィールドにユニットが２体より多い場合
    if (
      stack.processing.owner.field.length > 2 &&
      stack.processing.delta.some(delta => delta.source?.unit === stack.processing.id)
    ) {
      stack.processing.delta = stack.processing.delta.filter(
        delta => delta.source?.unit !== stack.processing.id
      );
    }
  },
};
