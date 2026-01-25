import { Unit } from '@/package/core/class/card';
import { EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分のユニットが召喚された場合のみ
    const isOwnUnit = stack.target instanceof Unit && stack.target.owner.id === owner.id;

    // 対戦相手のフィールドにウィルスを挿入できるか（ウィルス以外が4体以下）
    const canInjectVirus = EffectHelper.isVirusInjectable(opponent);

    return isOwnUnit && canInjectVirus;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(
      stack,
      '黙想の薔薇',
      '【ウィルス】を除外\n＜ウィルス・黙＞を【特殊召喚】\nインターセプトカードを1枚引く'
    );

    // 対戦相手のフィールドにいる【ウィルス】ユニットを除外し、＜ウィルス・黙＞を【特殊召喚】
    await EffectTemplate.virusInject(stack, opponent, '＜ウィルス・黙＞');

    // インターセプトカードを1枚引く
    EffectTemplate.reinforcements(stack, owner, { type: ['intercept'] });
  },
};
