import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import { EffectHelper } from './helper';
import type { Card, Unit } from '@/package/core/class/card';
import { MessageHelper } from '@/package/core/message';

export class Effect {
  static async damage(stack: Stack, core: Core, source: Card, target: Unit, value: number) {
    // 対象がフィールド上に存在するか確認
    const exists = EffectHelper.owner(core, target).find(target);
    const isOnField = exists.result && exists.place?.name === 'field';
    if (!isOnField) return;

    // TODO: 耐性持ちのチェックをここでやる

    target.bp.damage += value;
    stack.addChildStack('damage', source, target);
    core.room.broadcastToAll(MessageHelper.sound('damage'));

    // 破壊された?
    if (target.bp.base + target.bp.diff - target.bp.damage <= 0) {
      this.break(stack, core, source, target, 'damage');
    }
  }

  /**
   * 対象を破壊する
   * @param source 効果の発動元
   * @param target 破壊の対象
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async break(
    stack: Stack,
    core: Core,
    source: Card,
    target: Unit,
    cause: string = 'effect'
  ) {
    // 対象がフィールド上に存在するか確認
    const exists = EffectHelper.owner(core, target).find(target);
    const isOnField =
      exists.result && exists.place?.name === 'field' && target.destination !== 'trash';

    if (!isOnField) return;

    // TODO: 耐性持ちのチェックをここでやる
    stack.addChildStack('break', source, target);
    target.destination = 'trash';
    core.room.broadcastToAll(MessageHelper.sound('bang'));
    console.log('破壊スタック!!');
  }
}
