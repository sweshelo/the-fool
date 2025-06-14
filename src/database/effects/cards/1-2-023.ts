import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { EffectHelper } from '../classes/helper';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const target = stack.target instanceof Unit ? stack.target : undefined;

    // 対象が進化ユニットでない、または対象が対戦相手のユニットでない場合は発動しない
    if (
      !target ||
      target.catalog.type !== 'advanced_unit' ||
      target.owner.id !== self.owner.opponent.id
    )
      return;

    await System.show(stack, '聖吹のシンフォニー', '行動権消費');

    // 対戦相手の全てのユニットの行動権を消費
    target.owner.field.forEach(unit => {
      Effect.activate(stack, self, unit, false);
    });
  },

  onPlayerAttack: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const opponent = self.owner.opponent;

    // 対戦相手のフィールドにユニットが存在するか かつ 対象が対戦相手のユニットか確認
    if (
      opponent.field.length === 0 ||
      !(stack.source instanceof Unit) ||
      stack.source.owner.id !== stack.processing.owner.opponent.id
    )
      return;

    // レベル2以上のユニットが存在するか確認
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.lv >= 2 && unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );
    if (candidates.length === 0) return;

    await System.show(stack, '光の守護精霊', '手札に戻す');

    // 対戦相手のレベル2以上のユニットを1体選ぶ
    const [target] = await EffectHelper.selectUnit(
      stack,
      self.owner,
      candidates,
      '手札に戻すユニットを選んでください'
    );

    if (!target) return;

    Effect.bounce(stack, self, target, 'hand');
  },
};
