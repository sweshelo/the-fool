import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■八咫鏡
  // 様々なレベルに応じた効果を持つカード

  // フィールド効果: レベル1の時に【加護】を与える
  fieldEffect(stack: StackWithCard<Unit>) {
    const self = stack.processing;

    // 自身が与えた加護の効果があるか確認
    const delta = self.delta.find(
      delta => delta.source?.unit === self.id && delta.source?.effectCode === 'level1_protection'
    );

    if (self.lv === 1) {
      // レベル1の時に【加護】を与える
      if (!delta) {
        Effect.keyword(stack, self, self, '加護', {
          source: { unit: self.id, effectCode: 'level1_protection' },
        });
      }
    } else if (delta) {
      // レベル1以外では自身が与えた【加護】を除外
      self.delta = self.delta.filter(
        d => d.source?.unit !== self.id || d.source?.effectCode !== 'level1_protection'
      );
    }
  },

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '八咫鏡', 'レベル1の時【加護】を得る');
  },

  // プレイヤーアタックを受けた時の効果
  async onPlayerAttack(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;

    // 自分がプレイヤーアタックを受けた時のみ発動
    if (
      stack.source instanceof Unit &&
      stack.source.owner.id === owner.opponent.id && // 相手のユニットがアタックしている
      stack.target?.id === owner.id // 自分がプレイヤーアタックを受けている
    ) {
      await System.show(stack, '八咫鏡', 'ユニットを消滅\nレベル+1');

      // アタックしてきたユニットを消滅させる
      Effect.delete(stack, stack.processing, stack.source);

      // 自身のレベルを+1する
      Effect.clock(stack, stack.processing, stack.processing, 1);
    }
  },

  // ターン終了時の効果
  async onTurnEnd(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;
    const turnPlayer = stack.core.getTurnPlayer();

    // 自分のターン終了時かつ自身がレベル1の場合に発動
    if (owner.id === turnPlayer.id && stack.processing.lv === 1) {
      const hasOwnUnits = EffectHelper.isUnitSelectable(stack.core, 'owns', owner);
      const hasOpponentUnits = EffectHelper.isUnitSelectable(stack.core, 'opponents', owner);

      // お互いの最低どちらかユニットがいる場合のみ処理
      if (hasOwnUnits || hasOpponentUnits) {
        await System.show(stack, '八咫鏡', 'お互いのユニットを消滅');
        const deleteTargets: Unit[] = [];

        // 自分のユニットを1体選択
        if (hasOwnUnits) {
          const [ownTarget] = await EffectHelper.pickUnit(
            stack,
            owner,
            'owns',
            '消滅させる自分のユニットを選択'
          );
          deleteTargets.push(ownTarget);
        }

        // 相手のユニットを1体選択
        if (hasOpponentUnits) {
          const [opponentTarget] = await EffectHelper.pickUnit(
            stack,
            owner,
            'opponents',
            '消滅させる相手のユニットを選択'
          );
          deleteTargets.push(opponentTarget);
        }

        // 選択したユニットを消滅させる
        deleteTargets.forEach(unit => Effect.delete(stack, stack.processing, unit));
      }
    }
  },

  // レベル3にクロックアップした時の効果
  async onClockupSelf(stack: StackWithCard<Unit>) {
    // レベル3にクロックアップした時のみ発動
    if (stack.processing.lv === 3) {
      const owner = stack.processing.owner;

      await System.show(stack, '八咫鏡', '味方全体に【加護】付与\nライフ+2');

      // 全ての味方ユニットに【加護】を与える
      for (const unit of owner.field) {
        Effect.keyword(stack, stack.processing, unit, '加護');
      }

      // ライフを+2する
      owner.life.current = Math.min(owner.life.current + 2, owner.life.max);
    }
  },
};
