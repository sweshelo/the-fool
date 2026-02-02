import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

const summonFromTrash = async (stack: StackWithCard<Unit>) => {
  const candidate = stack.processing.owner.trash.filter(
    (card): card is Unit =>
      card instanceof Unit &&
      !(card instanceof Evolve) &&
      card.catalog.cost <= 2 &&
      (card.catalog.species?.includes('昆虫') ?? false)
  );
  const [target] = EffectHelper.random(candidate);

  if (stack.processing.owner.field.length <= 4 && target) {
    await System.show(stack, '女王様のしもべ隊', '捨札から【昆虫】を【特殊召喚】');
    await Effect.summon(stack, stack.processing, target);
  }
};

export const effects: CardEffects = {
  // ■女王様のしもべ隊
  // あなたのターン終了時、あなたのフィールドのユニットが４体以下の場合、
  // あなたの捨札から進化ユニット以外のコスト２以下の【昆虫】ユニットをランダムで１体【特殊召喚】する。
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン終了時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await summonFromTrash(stack);
    }
  },

  // ■侵攻開始！
  // このユニットがアタックした時、あなたの【昆虫】ユニットを１体選ぶ。それに【スピードムーブ】を与える。
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const filter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.id &&
      (unit.catalog.species?.includes('昆虫') ?? false);

    if (!EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) return;

    await System.show(
      stack,
      '侵攻開始！',
      'あなたの【昆虫】ユニットを1体選ぶ\nそれに【スピードムーブ】を与える'
    );

    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      'スピードムーブを与えるユニットを選択'
    );

    if (target) {
      Effect.speedMove(stack, target);
    }
  },
};
