import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    // 自身以外のユニットのBPの合計を計算
    const totalBP = owner.field
      .filter(unit => unit.id !== self.id)
      .reduce((sum, unit) => sum + unit.currentBP, 0);

    if (totalBP > 0) {
      await System.show(
        stack,
        'ブリトンの守護神',
        '【加護】\n【王の治癒力】\n基本BP+[フィールドの他ユニットの合計]'
      );
      // 基本BPを加算
      Effect.modifyBP(stack, self, self, totalBP, { isBaseBP: true });
    } else {
      await System.show(
        stack,
        '加護&王の治癒力',
        '効果に選ばれない\n自身のBP未満のダメージを受けない'
      );
    }

    Effect.keyword(stack, self, self, '加護');
    Effect.keyword(stack, self, self, '王の治癒力');
  },

  onTurnStart: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    if (stack.core.getTurnPlayer().id !== owner.opponent.id) return;

    await System.show(stack, 'ブリトンの守護神', '【神託】を与える');

    // 全てのユニットに【神託】を与える
    owner.field.forEach(unit => {
      Effect.keyword(stack, self, unit, '神託');
    });
  },

  onDrive: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const target = stack.target instanceof Unit ? stack.target : undefined;

    // 自身に【神託】がある場合 かつ 対象が存在する かつ 対象が対戦相手の場合のみ発動
    if (!self.hasKeyword('神託') || !target || target.owner.id !== self.owner.opponent.id) return;

    await System.show(stack, 'ブリトンの守護神', '行動権を消費');

    // 対象の行動権を消費
    Effect.activate(stack, self, target, false);

    // 自身の【神託】を取り除く
    Effect.removeKeyword(stack, self, '神託');
  },

  onBreakSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    // 手札の上限チェック
    if (owner.hand.length >= stack.core.room.rule.player.max.hand) return;

    await System.show(stack, 'ブリトンの守護神', '[聖剣・エクスカリバー]を手札に作成');

    // エクスカリバーを作成
    const excalibur = new Unit(owner, '2-0-312');
    owner.hand.push(excalibur);
  },
};
