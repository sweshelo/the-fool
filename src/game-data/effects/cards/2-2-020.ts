import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

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
      await System.show(stack, 'ハートスティール', 'CPを奪う\n基本BP-2000/+2000');

      // CP奪取
      const stolenCP = Math.min(12, opponent.cp.current);
      Effect.modifyCP(stack, self, opponent, -stolenCP);
      Effect.modifyCP(stack, self, owner, stolenCP);

      // 連撃効果
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        '基本BPを-2000するユニットを選択'
      );
      Effect.modifyBP(stack, self, target, -2000, { isBaseBP: true });
      Effect.modifyBP(stack, self, self, 2000, { isBaseBP: true });
    } else if (canStealCP) {
      // ハートスティールのみ
      await System.show(stack, 'ハートスティール', 'CPを奪う');

      const stolenCP = Math.min(12, opponent.cp.current);
      Effect.modifyCP(stack, self, opponent, -stolenCP);
      Effect.modifyCP(stack, self, owner, stolenCP);
    } else if (canCombo) {
      // 連撃のみ
      await System.show(stack, '連撃・バトレコンフュージョン', '基本BP-2000/+2000');

      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        '基本BPを-2000するユニットを選択'
      );
      Effect.modifyBP(stack, self, target, -2000, { isBaseBP: true });
      Effect.modifyBP(stack, self, self, 2000, { isBaseBP: true });
    }
    // 両方発動できない場合は何もしない
  },
};
