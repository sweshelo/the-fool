import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import { EffectHelper } from './helper';
import type { Card, Unit } from '@/package/core/class/card';

export class Effect {
  static async damage(stack: Stack, core: Core, source: Card, target: Unit, value: number) {
    // 対象がフィールド上に存在するか確認
    const exists = EffectHelper.owner(core, target).find(target);
    const isOnField = exists.result && exists.place?.name === 'field';
    if (!isOnField) return;

    // TODO: 耐性持ちのチェックをここでやる

    target.bp.damage += value;
    stack.addChildStack('damage', source, target);
    core.room.broadcastToAll({
      action: {
        type: 'effect',
        handler: 'client',
      },
      payload: {
        type: 'SoundEffect',
        soundId: 'damage',
      },
    });

    // 破壊された?
    if (target.bp.base + target.bp.diff - target.bp.damage <= 0) {
      target.destination = 'trash';
      stack.addChildStack('break', source, target);
      console.log('> 破壊', source, target);
    }
  }
}
