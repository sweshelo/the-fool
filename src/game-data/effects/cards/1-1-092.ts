import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■トリックオアトリート
  // あなたのユニットがフィールドに出た時、トリガーカードを1枚引く。
  checkDrive(stack: StackWithCard) {
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  async onDrive(stack: StackWithCard) {
    await System.show(stack, 'トリックオアトリート', 'トリガーカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
  },

  // あなたのユニットがプレイヤーアタックに成功した時、カードを1枚引く。
  checkPlayerAttack(stack: StackWithCard) {
    return stack.source instanceof Unit && stack.processing.owner.id === stack.source.owner.id;
  },

  async onPlayerAttack(stack: StackWithCard) {
    await System.show(stack, 'トリックオアトリート', 'カードを1枚引く');
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },

  // あなたのユニットが戦闘によって対戦相手のユニットを破壊した時、インターセプトカードを1枚引く。
  checkWin(stack: StackWithCard) {
    return stack.source instanceof Unit && stack.source.owner.id === stack.processing.owner.id;
  },

  async onWin(stack: StackWithCard) {
    await System.show(stack, 'トリックオアトリート', 'インターセプトカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });
  },
};
