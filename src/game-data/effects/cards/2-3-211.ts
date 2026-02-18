import { Delta } from '@/package/core/class/delta';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 【スピードムーブ】【破壊効果耐性】（召喚時付与）
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(
      stack,
      'スピードムーブ＆破壊効果耐性',
      '行動制限の影響を受けない\n効果によって破壊されない'
    );
    Effect.speedMove(stack, stack.processing);
    Effect.keyword(stack, stack.processing, stack.processing, '破壊効果耐性');
  },

  // 手札のこのカードのコスト減少
  handEffect: (_core: unknown, self: Unit) => {
    const delta = self.delta.find(delta => delta.source?.unit === self.id);
    const usedUnits = [...self.owner.field, ...self.owner.opponent.field].filter(
      unit => !unit.active
    ).length;
    const reduce = Math.max(-usedUnits, -6);

    if (delta && delta.effect.type === 'cost') {
      delta.effect.value = reduce;
    } else {
      self.delta.push(
        new Delta(
          { type: 'cost', value: reduce },
          {
            source: {
              unit: self.id,
            },
          }
        )
      );
    }
  },

  // このユニットがアタックした時、対戦相手の全ての行動済ユニットを消滅させる。
  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    const opponent = stack.processing.owner.opponent;
    const usedUnits = opponent.field.filter(unit => !unit.active);

    if (usedUnits.length === 0) return;

    await System.show(stack, '漏れ出した厄災', '行動済ユニットを消滅');
    for (const unit of usedUnits) {
      Effect.delete(stack, stack.processing, unit);
    }
  },

  // 対戦相手のターン開始時、対戦相手のユニットを1体選ぶ。それの行動権を消費し5000ダメージを与える。
  onTurnStart: async (stack: StackWithCard<Unit>) => {
    if (
      !EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner) ||
      stack.processing.owner.id === stack.core.getTurnPlayer().id
    )
      return;

    await System.show(stack, '虚ろの無海', '行動権を消費\n5000ダメージ');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '行動権を消費し5000ダメージを与えるユニットを選んでください',
      1
    );
    if (!target) return;

    Effect.activate(stack, stack.processing, target, false);
    Effect.damage(stack, stack.processing, target, 5000);
  },
};
