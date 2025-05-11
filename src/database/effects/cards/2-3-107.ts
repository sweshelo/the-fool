import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // ■ソロモンへの反逆
  // このユニットがフィールドに出た時、このユニット以外の全てのユニットに［あなたの捨札の赤属性のカードの枚数×500］ダメージを与える。
  // この効果であなたのユニットを破壊した場合、【スピードムーブ】を得る。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 捨札の赤属性カードの枚数を数える
    const redCardsInTrash = owner.trash.filter(card => card.catalog.color === Color.RED);
    const damage = redCardsInTrash.length * 500;

    // 対象となるユニット（このユニット以外の全てのユニット）
    const targetUnits = [
      ...owner.field.filter(unit => unit.id !== stack.processing.id),
      ...opponent.field,
    ];

    if (targetUnits.length > 0 && damage > 0) {
      await System.show(stack, 'ソロモンへの反逆', `[捨札の赤属性カード×500]ダメージ`);

      // 自分のユニットを破壊した場合は【スピードムーブ】を得る
      if (
        targetUnits
          .map(
            unit =>
              Effect.damage(stack, stack.processing, unit, damage) &&
              unit.owner.id === stack.processing.owner.id
          )
          .includes(true)
      ) {
        await System.show(stack, 'ソロモンへの反逆', '【スピードムーブ】を得る');
        Effect.speedMove(stack, stack.processing);
      }
    }
  },

  // ■絶魔王の秘術
  // このユニットがプレイヤーアタックに成功した時、あなたの捨札に赤属性のカードが10枚以上ある場合、
  // このユニットの行動権を回復する。あなたの捨札にあるカードをランダムで10枚消滅させる。
  onAttackPlayerSuccess: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 捨札の赤属性カードの枚数を数える
    const redCardsInTrash = owner.trash.filter(card => card.catalog.color === Color.RED);

    if (redCardsInTrash.length >= 10) {
      await System.show(stack, '絶魔王の秘術', '行動権回復\n捨札からランダムで10枚消滅');

      // 行動権を回復
      Effect.activate(stack, stack.processing, stack.processing, true);

      // 捨札からランダムで10枚選んで消滅させる
      const cardsToDelete = EffectHelper.random(owner.trash, 10);

      cardsToDelete.forEach(card => {
        Effect.move(stack, stack.processing, card, 'delete');
      });
    }
  },
};
