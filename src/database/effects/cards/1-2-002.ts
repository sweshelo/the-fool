import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

const mainEffect = async (stack: StackWithCard<Unit>, exceptSelf: boolean = false) => {
  // 対戦相手のユニットが存在するか確認
  const opponentUnits = EffectHelper.candidate(
    stack.core,
    unit => unit.owner.id !== stack.processing.owner.id,
    stack.processing.owner
  );

  if (stack.target instanceof Unit && stack.processing.id === stack.target.id && exceptSelf) return;

  if (
    !(stack.target instanceof Unit) ||
    !stack.target.catalog.species?.includes('昆虫') ||
    stack.processing.owner.id !== stack.target.owner.id
  )
    return;

  if (opponentUnits.length > 0) {
    await System.show(stack, 'バグ・バースト', '2000ダメージ');

    // 対象を1体選択
    const [target] = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      opponentUnits,
      'ダメージを与えるユニットを選択'
    );

    // 2000ダメージを与える
    Effect.damage(stack, stack.processing, target, 2000);
  }
};

export const effects: CardEffects = {
  // ■バグ・バースト
  // あなたの【昆虫】ユニットがフィールドに出た時、また破壊された時、対戦相手のユニットを1体選ぶ。
  // それに2000ダメージを与える。

  onDrive: async (stack: StackWithCard<Unit>) => await mainEffect(stack, true),
  onDriveSelf: mainEffect,

  onBreak: async (stack: StackWithCard<Unit>) => await mainEffect(stack, true),
  onBreakSelf: mainEffect,
};
