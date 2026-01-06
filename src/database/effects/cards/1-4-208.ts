import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【消滅効果耐性】
  // ■裂帛の威令
  // 対戦相手のBP7000以上のユニットに【防御禁止】を与える。
  // このユニットがフィールドに出た時、【悪魔】ユニットのカードを1枚ランダムで手札に加える。
  // あなたのユニットがフィールドに出るたび、ユニットを1体選ぶ。それのBPをターン終了時まで+3000する。

  // 召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対象を1体選択
    const filter = (unit: Unit) => true;

    await System.show(
      stack,
      '裂帛の威令',
      `【消滅効果耐性】\n【悪魔】を1枚引く\nBP7000以上に【防御禁止】\nBP+3000`
    );
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      filter,
      'BPを+3000するユニットを選択'
    );

    // BPを+3000（ターン終了時まで）
    Effect.modifyBP(stack, stack.processing, target, 3000, {
      event: 'turnEnd',
      count: 1,
    });

    // 消滅効果耐性を付与
    Effect.keyword(stack, stack.processing, stack.processing, '消滅効果耐性');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '悪魔' });
  },

  // 自分のユニット召喚時効果
  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 召喚されたユニットが自分のユニットか確認
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.processing.id !== stack.target.id
    ) {
      // プレイヤーのフィールド上のユニットを全て取得
      const filter = (unit: Unit) => true;

      if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        await System.show(stack, '裂帛の威令', 'BP+3000');

        // 対象を1体選択
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          'BP+3000するユニットを選択'
        );

        // BPを+3000（ターン終了時まで）
        Effect.modifyBP(stack, stack.processing, target, 3000, {
          event: 'turnEnd',
          count: 1,
        });
      }
    }
  },

  // フィールド効果：対戦相手のBP7000以上のユニットに防御禁止を与える
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // 対戦相手のフィールドのBP7000以上のユニットを対象にする
    stack.processing.owner.opponent.field.forEach(unit => {
      // BP7000以上のユニットか確認
      if (unit.currentBP >= 7000) {
        // 既にこのユニットが発行したDeltaが存在するか確認
        const delta = unit.delta.find(
          d => d.source?.unit === stack.processing.id && d.source?.effectCode === '裂帛の威令'
        );

        // 既にDeltaが存在しない場合のみ防御禁止を付与
        if (!delta) {
          Effect.keyword(stack, stack.processing, unit, '防御禁止', {
            source: { unit: stack.processing.id, effectCode: '裂帛の威令' },
          });
        }
      } else {
        // BP7000未満になった場合、このユニットが付与した防御禁止を削除
        unit.delta = unit.delta.filter(
          d => !(d.source?.unit === stack.processing.id && d.source?.effectCode === '裂帛の威令')
        );
      }
    });
  },
};
