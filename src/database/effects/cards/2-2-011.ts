import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■ライジングストーム
  // このユニットがフィールドに出た時、対戦相手の行動済ユニットを1体選ぶ。それを消滅させる。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    // 選択可能なユニットが存在するか確認（選択可能か、EffectHelper.candidateでチェック）
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => (!unit.active && unit.owner.id === opponent.id ? true : false),
      stack.processing.owner
    );

    // 自分の全ての機械ユニットをフィルタリング
    const machineUnits = stack.processing.owner.field.filter(
      unit =>
        unit.catalog.species &&
        Array.isArray(unit.catalog.species) &&
        unit.catalog.species.includes('機械')
    );

    if (candidates.length > 0) {
      await System.show(
        stack,
        'ライジングストーム＆イグナイトフォース',
        '敵の行動済ユニット1体を消滅\nレベル+1'
      );

      // ユニットを選択
      try {
        const [selected] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          candidates,
          'ライジングストーム'
        );

        // 機械ユニットのレベルを+1する
        machineUnits.forEach(unit => {
          Effect.clock(stack, stack.processing, unit, 1);
        });

        // 選択されたユニットを消滅させる
        Effect.delete(stack, stack.processing, selected);
      } catch (error) {
        console.error('ユニット選択エラー:', error);
      }
    } else {
      await System.show(stack, 'イグナイトフォース', 'レベル+1');
      // 機械ユニットのレベルを+1する
      machineUnits.forEach(unit => {
        Effect.clock(stack, stack.processing, unit, 1);
      });
    }
  },

  // ■イグナイトフォース
  // あなたの【機械】ユニットがフィールドに出た時、あなたの全ての【機械】ユニットのレベルを+1する。
  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 召喚されたユニットが機械タイプかつ自分の所有ユニットかチェック
    const target = stack.target;
    if (
      target &&
      target instanceof Unit &&
      target.catalog.species &&
      Array.isArray(target.catalog.species) &&
      target.catalog.species.includes('機械') &&
      target.owner.id === stack.processing.owner.id &&
      target.id !== stack.processing.id // 自分自身でない
    ) {
      // 自分の全ての機械ユニットをフィルタリング
      const machineUnits = stack.processing.owner.field.filter(
        unit =>
          unit.catalog.species &&
          Array.isArray(unit.catalog.species) &&
          unit.catalog.species.includes('機械')
      );

      if (machineUnits.length > 0) {
        await System.show(stack, 'イグナイトフォース', '機械ユニットのレベル+1');

        // 機械ユニットのレベルを+1する
        machineUnits.forEach(unit => {
          Effect.clock(stack, stack.processing, unit, 1);
        });
      }
    }
  },

  // ■デュアルシールド
  // このユニットがオーバークロックした時、あなたの【機械】ユニットを2体まで選ぶ。それらに【加護】を与える。
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 選択可能なユニットが存在するか確認（選択可能か、EffectHelper.candidateでチェック）
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => {
        return unit.catalog.species &&
          Array.isArray(unit.catalog.species) &&
          unit.catalog.species.includes('機械') &&
          unit.owner.id === stack.processing.owner.id
          ? true
          : false;
      },
      stack.processing.owner
    );

    if (candidates.length > 0) {
      await System.show(stack, 'デュアルシールド', '機械ユニット最大2体に【加護】');

      try {
        // ユニットを選択（最大2体）
        const selected: Unit[] = [];

        // 最大2体選択するために2回繰り返す
        for (let i = 0; i < 2; i++) {
          if (candidates.length > selected.length) {
            const remainingUnits = candidates.filter(unit => !selected.some(s => s.id === unit.id));

            if (remainingUnits.length > 0) {
              const [unit] = await EffectHelper.selectUnit(
                stack,
                stack.processing.owner,
                remainingUnits,
                'デュアルシールド'
              );
              selected.push(unit);
            }
          }
        }

        // 選択されたユニットに【加護】を与える
        selected.forEach(unit => {
          Effect.keyword(stack, stack.processing, unit, '加護');
        });
      } catch (error) {
        console.error('ユニット選択エラー:', error);
      }
    }
  },
};
