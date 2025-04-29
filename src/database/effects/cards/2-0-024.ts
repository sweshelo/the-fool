import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
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
    const choices: Choices = {
      title: '捨てるカードを選択してください',
      type: 'card',
      items: owner.hand,
      count: 1,
    };

    const [response] = await System.prompt(stack, owner.id, choices);
    const target = owner.hand.find(card => card.id === response);
    if (!target) throw new Error('正しいカードが選択されませんでした');
    Effect.handes(stack, stack.processing, target);

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
    // stack.source が自ユニットでない or stack.sourceがコスト2以上のユニットでない or 比較対象が自分自身の場合は中断
    if (
      !(stack.target instanceof Unit) ||
      stack.target.catalog.cost < 2 ||
      stack.target.owner.id !== stack.processing.owner.id ||
      stack.target.id === stack.processing.id
    )
      return;

    // 相手フィールドに選択可能なユニットが存在するか
    const owner = stack.processing.owner;
    const candidate = EffectHelper.candidate(
      stack.core,
      (unit: Unit) => unit.owner.id !== owner.id
    );

    // ユニットが生存していない場合は処理を中断する
    if (
      !stack.processing.owner.field.find(unit => unit.id === stack.processing.id) ||
      candidate.length === 0
    )
      return;

    await System.show(stack, '風のおしおき', 'お互いにBPダメージ');
    const [damageUnitId] = await System.prompt(
      stack,
      EffectHelper.owner(stack.core, stack.processing).id,
      {
        type: 'unit',
        title: 'ダメージを与えるユニットを選択',
        items: candidate,
      }
    );
    const damageUnit = candidate.find(unit => unit.id === damageUnitId);
    if (!damageUnit) throw new Error('対象のユニットが見つかりませんでした');

    const [damageA, damageB] = [stack.target.currentBP(), damageUnit.currentBP()];
    Effect.damage(stack, stack.processing, damageUnit, damageA, 'effect');
    Effect.damage(stack, stack.processing, stack.target, damageB, 'effect');
  },
};
