import { Effect, System } from '..';
import { Delta } from '@/package/core/class/delta';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // このカードがフィールドに出た時、フィールド効果の内容を表示
  async onDriveSelf(stack: StackWithCard<Unit>) {
    await System.show(
      stack,
      '転戦の天ノ河',
      '手札の【戦士】コスト-1\n【戦士】のBPを+[【戦士】数×500]'
    );
  },

  // ■転戦の天ノ河
  // あなたの手札の【戦士】ユニットのコストを-1する。
  // あなたの【戦士】ユニットのBPを+[あなたのフィールドにいる【戦士】×500]する。
  fieldEffect(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;

    // フィールド上の戦士ユニット数をカウント
    const warriorCount = owner.field.filter(unit => unit.catalog.species?.includes('戦士')).length;

    // BP増加量
    const bpBonus = warriorCount * 500;

    // 手札の戦士ユニットのコスト減少処理
    for (const card of owner.hand) {
      if (card instanceof Unit && card.catalog.species?.includes('戦士')) {
        const existingDelta = card.delta.find(
          delta =>
            delta.source?.unit === stack.processing.id &&
            delta.source?.effectCode === 'warrior_cost_reduction'
        );

        if (!existingDelta) {
          card.delta.push(
            new Delta(
              { type: 'cost', value: -1 },
              {
                source: {
                  unit: stack.processing.id,
                  effectCode: 'warrior_cost_reduction',
                },
              }
            )
          );
        }
      }
    }

    // フィールド上の戦士ユニットのBP増加処理
    for (const unit of owner.field) {
      if (unit.catalog.species?.includes('戦士')) {
        const existingDelta = unit.delta.find(
          delta =>
            delta.source?.unit === stack.processing.id &&
            delta.source?.effectCode === 'warrior_bp_boost'
        );

        if (existingDelta) {
          // 既存のDeltaを更新 (BP deltaの場合はdiffプロパティを使用)
          if (existingDelta.effect.type === 'bp') {
            existingDelta.effect.diff = bpBonus;
          }
        } else {
          // 新しいDeltaを追加
          Effect.modifyBP(stack, stack.processing, unit, bpBonus, {
            source: { unit: stack.processing.id, effectCode: 'warrior_bp_boost' },
          });
        }
      }
    }
  },

  // ■星華の導き
  // あなたの【戦士】ユニットがフィールドに出た時、それに【スピードムーブ】を与える。
  async onDrive(stack: StackWithCard) {
    // 召喚されたユニットが戦士タイプかつ自分の所有ユニットかチェック
    if (
      stack.target instanceof Unit &&
      stack.target.catalog.species?.includes('戦士') &&
      stack.target.owner.id === stack.processing.owner.id
    ) {
      await System.show(stack, '星華の導き', '【スピードムーブ】を与える');
      Effect.speedMove(stack, stack.target);
    }
  },

  // ■星輝の恩寵
  // あなたのユニットがプレイヤーアタックに成功した時、それのレベルを+1する。
  async onPlayerAttack(stack: StackWithCard) {
    // 自分のユニットがプレイヤーアタックに成功した時のみ発動
    if (stack.source instanceof Unit && stack.source.owner.id === stack.processing.owner.id) {
      await System.show(stack, '星輝の恩寵', 'レベル+1');
      Effect.clock(stack, stack.processing, stack.source, 1);
    }
  },
};
