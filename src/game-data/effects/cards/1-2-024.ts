import { PermanentEffect } from '@/game-data/effects/engine/permanent';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■八咫鏡
  // フィールド効果: レベル1の時に【加護】を与える
  fieldEffect(stack: StackWithCard<Unit>) {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '加護', { source });
      },
      targets: ['self'],
      effectCode: '八咫鏡',
    });
  },

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '八咫鏡', 'レベル1の時【加護】を得る');
  },

  // プレイヤーアタックを受けた時の効果
  async onPlayerAttack(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;
    const source = stack.source;

    // 自分がプレイヤーアタックを受けた時のみ発動
    if (
      source instanceof Unit &&
      source.owner.id === owner.opponent.id && // 相手のユニットがアタックしている
      stack.target?.id === owner.id // 自分がプレイヤーアタックを受けている
    ) {
      await EffectHelper.combine(stack, [
        {
          title: '八咫鏡',
          description: 'ユニットを消滅',
          effect: () => Effect.delete(stack, stack.processing, source),
          condition: source.owner.field.some(unit => unit.id === source.id),
        },
        {
          title: '八咫鏡',
          description: 'レベル+1',
          effect: () => Effect.clock(stack, stack.processing, stack.processing, 1),
          condition: stack.processing.lv < 3,
        },
      ]);
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
