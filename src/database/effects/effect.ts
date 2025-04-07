import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { ICard, IUnit } from '@/submodule/suit/types';
import { EffectHelper } from './helper';

export class Effect {
  static async damage(stack: Stack, core: Core, source: ICard, target: IUnit, value: number) {
    // 対象がフィールド上に存在するか確認
    const exists = EffectHelper.owner(core, target).find(target);
    const isOnField = exists.result && exists.place?.name === 'field';
    if (!isOnField) return;

    // TODO: 耐性持ちのチェックをここでやる

    target.bp.damage += value;
    stack.addChildStack('damage', source, target);

    // 破壊された?
    if (target.bp.base + target.bp.diff - target.bp.damage <= 0) {
      stack.addChildStack('break', source, target);
    }
  }
}
