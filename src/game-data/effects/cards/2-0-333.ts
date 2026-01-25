import { Unit } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant/color';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■押均す無窮の腕
  // ［▲4］このユニットがフィールドに出た時、あなたの紫ゲージが4以上の場合、対戦相手の全てのBP6000以上のユニットを破壊する。あなたの紫ゲージを-4する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    const purple = owner.purple ?? 0;

    // 紫ゲージが4以上でなければ発動しない
    if (purple < 4) return;

    // BP6000以上の相手ユニットをフィルタリング
    const targets = opponent.field.filter(unit => unit.currentBP >= 6000);
    if (targets.length === 0) return;

    await System.show(stack, '押均す無窮の腕', 'BP6000以上を全て破壊');

    // 対戦相手の全てのBP6000以上のユニットを破壊
    for (const target of targets) {
      Effect.break(stack, stack.processing, target);
    }

    // 紫ゲージを-4する
    await Effect.modifyPurple(stack, stack.processing, owner, -4);
  },

  // 対戦相手のターン時、あなたの紫ユニットが効果によって破壊された時、捨札からインターセプトカードを1枚ランダムで手札に加え、あなたの紫ゲージを+1する。
  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のターン時のみ発動
    if (stack.core.getTurnPlayer().id !== opponent.id) return;

    // 破壊されたのが自分の紫ユニットか確認
    if (!(stack.target instanceof Unit)) return;
    if (stack.target.owner.id !== owner.id) return;
    if (stack.target.catalog.color !== Color.PURPLE) return;

    // 効果による破壊か確認
    if (!EffectHelper.isBreakByEffect(stack)) return;

    // 捨札にインターセプトカードがあるか確認
    const interceptCards = owner.trash.filter(card => card.catalog.type === 'intercept');
    if (interceptCards.length === 0) {
      // インターセプトがなくても紫ゲージは増える
      await System.show(stack, '押均す無窮の腕', '紫ゲージ+1');
      await Effect.modifyPurple(stack, stack.processing, owner, 1);
      return;
    }

    await System.show(stack, '押均す無窮の腕', 'インターセプトを手札に加える\n紫ゲージ+1');

    // ランダムで1枚選んで手札に加える
    EffectHelper.random(interceptCards, 1).forEach(card => {
      Effect.move(stack, stack.processing, card, 'hand');
    });

    // 紫ゲージを+1する
    await Effect.modifyPurple(stack, stack.processing, owner, 1);
  },

  // インターセプトカードが発動するたび、ユニットを1体選ぶ。それの基本BPを+2000する。
  onIntercept: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のインターセプトカードが発動した場合のみ処理
    if (stack.source.id !== owner.id) return;

    // ユニットを選べるか確認
    if (!EffectHelper.isUnitSelectable(stack.core, 'all', owner)) return;

    await System.show(stack, '押均す無窮の腕', '基本BP+2000');

    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'all',
      '基本BPを+2000するユニットを選択'
    );

    Effect.modifyBP(stack, stack.processing, target, 2000, { isBaseBP: true });
  },
};
