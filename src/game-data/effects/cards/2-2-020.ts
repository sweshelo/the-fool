import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

// CP奪取処理
const stealCP = (stack: StackWithCard<Unit>, self: Unit, owner: typeof self.owner) => {
  const opponent = owner.opponent;
  const stolenCP = Math.min(12, opponent.cp.current);
  Effect.modifyCP(stack, self, opponent, -stolenCP);
  Effect.modifyCP(stack, self, owner, stolenCP);
};

// 連撃処理
const comboEffect = async (stack: StackWithCard<Unit>, self: Unit, owner: typeof self.owner) => {
  const [target] = await EffectHelper.pickUnit(
    stack,
    owner,
    'opponents',
    '基本BPを-2000するユニットを選択'
  );
  Effect.modifyBP(stack, self, target, -2000, { isBaseBP: true });
  Effect.modifyBP(stack, self, self, 2000, { isBaseBP: true });
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

    if (canStealCP && canCombo) {
      // 両方発動
      await System.show(
        stack,
        'ハートスティール＆連撃・バトレコンフュージョン',
        'CP-12\nCP+[減少させたCP]\n基本BP-2000\n基本BP+2000'
      );
      stealCP(stack, self, owner);
      await comboEffect(stack, self, owner);
    } else if (canStealCP) {
      // ハートスティールのみ
      await System.show(stack, 'ハートスティール', 'CP-12\nCP+[減少させたCP]');
      stealCP(stack, self, owner);
    } else if (canCombo) {
      // 連撃のみ
      await System.show(stack, '連撃・バトレコンフュージョン', '基本BP-2000\n基本BP+2000');
      await comboEffect(stack, self, owner);
    }
  },
};
