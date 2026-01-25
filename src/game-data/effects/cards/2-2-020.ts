import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

// CP奪取処理
const stealCP = (stack: StackWithCard<Unit>, self: Unit, owner: typeof self.owner) => {
  const opponent = owner.opponent;
  const stolenCP = Math.min(12, opponent.cp.current);
  Effect.modifyCP(stack, self, opponent, -stolenCP);
  Effect.modifyCP(stack, self, owner, stolenCP);
};

export const effects: CardEffects = {
  // ■ハートスティール
  // このユニットがフィールドに出た時、対戦相手のCPが1以上ある場合、対戦相手のCPを-12する。そうした場合、あなたのCPを+［減少させたCP×1］する。
  // ■連撃・バトレコンフュージョン
  // このユニットがフィールドに出た時、このターンにあなたがこのユニット以外のコスト2以上の緑属性のカードを使用している場合、対戦相手のユニットを1体選ぶ。それの基本BPを-2000する。このユニットの基本BPを+2000する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    // 連撃条件確認: このターンにコスト2以上の緑属性のカードを使用しているか
    const hasUsedGreenCardThisTurn = stack.core.histories.some(
      history =>
        history.card.id !== self.id &&
        history.card.catalog.color === Color.GREEN &&
        history.card.catalog.cost >= 2
    );

    // ハートスティール: CPを奪う
    const canStealCP = opponent.cp.current >= 1;

    // 連撃: 対戦相手のユニットを選べるか
    const canCombo =
      hasUsedGreenCardThisTurn && EffectHelper.isUnitSelectable(stack.core, 'opponents', owner);

    await EffectHelper.combine(stack, [
      {
        title: 'ハートスティール',
        description: 'CP-12\nCP+[減少させたCP]',
        effect: () => stealCP(stack, self, owner),
        condition: () => canStealCP,
        order: 1,
      },
      {
        title: '連撃・バトレコンフュージョン',
        description: '基本BP-2000',
        effect: async () => {
          const [target] = await EffectHelper.pickUnit(
            stack,
            stack.processing.owner,
            'opponents',
            '基本BPを減少させるユニットを選択して下さい'
          );
          Effect.modifyBP(stack, stack.processing, target, -2000, { isBaseBP: true });
        },
        condition: () =>
          EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner) &&
          canCombo,
      },
      {
        title: '連撃・バトレコンフュージョン',
        description: '基本BP+2000',
        effect: () =>
          Effect.modifyBP(stack, stack.processing, stack.processing, 2000, { isBaseBP: true }),
        condition: () => canCombo,
      },
    ]);
  },
};
