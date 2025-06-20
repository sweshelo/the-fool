import { Card, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのユニットを1体選ぶ。選んだユニットと、対戦相手のコスト2以下のユニットからランダムで1体をそれぞれのデッキに戻す。
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分のユニットを選択
    const selfCandidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === owner.id,
      owner
    );
    const opponentCandidates = opponent.field.filter(unit => unit.catalog.cost <= 2);

    if (selfCandidates.length === 0 || opponentCandidates.length === 0) return;

    await System.show(stack, 'アイリス・ソング', 'ユニットをデッキに戻す');
    const [selfTarget] = await EffectHelper.selectUnit(
      stack,
      owner,
      selfCandidates,
      'デッキに戻すユニットを選んでください',
      1
    );

    const [opponentTarget] = EffectHelper.random(opponentCandidates, 1);

    // 選択したユニットをデッキに戻す
    Effect.bounce(stack, stack.processing, selfTarget, 'deck');
    Effect.bounce(stack, stack.processing, opponentTarget as Unit, 'deck');
  },

  // 対戦相手のトリガーカードの効果が発動するたび、対戦相手のユニットを1体選ぶ。それの行動権を消費する。
  onTrigger: async (stack: StackWithCard<Unit>) => {
    // 相手のトリガーカードの効果が発動した時のみ
    if (!(stack.source instanceof Card) || stack.source.owner.id === stack.processing.owner.id)
      return;

    const opponent = stack.processing.owner.opponent;
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === opponent.id,
      opponent
    );

    if (candidates.length === 0) return;

    await System.show(stack, 'レインボウ・ソング', '行動権を消費');
    const [target] = await EffectHelper.selectUnit(
      stack,
      opponent,
      candidates,
      '行動権を消費するユニットを選んでください',
      1
    );
    if (!target) return;

    Effect.activate(stack, stack.processing, target, false);
  },
};
