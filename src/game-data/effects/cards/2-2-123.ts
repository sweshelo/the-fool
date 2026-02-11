import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■闇蟲の巣窟
  // ［▲２］このユニットがフィールドに出た時、
  // あなたのフィールドにユニットが３体以下で、あなたの紫ゲージが２以上の場合、
  // 捨札にある進化ユニット以外のコスト７以下の【昆虫】ユニットをランダムで２体まで【特殊召喚】する。
  // あなたの紫ゲージを－２する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;

    if (owner.field.length > 3) return;
    if ((owner.purple ?? 0) < 2) return;

    const candidates = owner.trash.filter(
      (card): card is Unit =>
        card instanceof Unit &&
        card.catalog.type === 'unit' && // ユニット
        card.catalog.cost <= 7 &&
        (card.catalog.species?.includes('昆虫') ?? false)
    );
    if (candidates.length === 0) return;

    await System.show(stack, '闇蟲の巣窟', '【昆虫】ユニットを2体まで【特殊召喚】\n紫ゲージ-2');

    const targets = EffectHelper.random(candidates, 2);
    for (const target of targets) {
      await Effect.summon(stack, self, target);
    }

    await Effect.modifyPurple(stack, self, owner, -2);
  },

  // ■蟲軍一致団結
  // あなたのターン終了時、あなたのフィールドに【昆虫】ユニットが３体以上いる場合、
  // あなたの【昆虫】ユニットの基本ＢＰを＋１０００する。
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;

    if (owner.id !== stack.core.getTurnPlayer().id) return;

    const insectUnits = owner.field.filter(unit => unit.catalog.species?.includes('昆虫'));
    if (insectUnits.length < 3) return;

    await System.show(stack, '蟲軍一致団結', '基本BP+1000');

    for (const unit of insectUnits) {
      Effect.modifyBP(stack, self, unit, 1000, { isBaseBP: true });
    }
  },
};
