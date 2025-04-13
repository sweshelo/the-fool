import type { Stack } from '@/package/core/class/stack';
import { EffectHelper } from './helper';
import type { Card, Unit } from '@/package/core/class/card';

export class Effect {
  static async damage(stack: Stack, source: Card, target: Unit, value: number) {
    // 対象がフィールド上に存在するか確認
    const exists = EffectHelper.owner(stack.core, target).find(target);
    const isOnField = exists.result && exists.place?.name === 'field';
    if (!isOnField) return;

    // TODO: 耐性持ちのチェックをここでやる

    target.bp.damage += value;
    stack.addChildStack('damage', source, target);
    stack.core.room.soundEffect('damage');

    // 破壊された?
    if (target.bp.base + target.bp.diff - target.bp.damage <= 0) {
      this.break(stack, source, target, 'damage');
    }
  }

  /**
   * 対象を破壊する
   * @param source 効果の発動元
   * @param target 破壊の対象
   */
  static async break(
    stack: Stack,
    source: Card,
    target: Unit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _cause: string = 'effect'
  ) {
    // 対象がフィールド上に存在するか確認
    const exists = EffectHelper.owner(stack.core, target).find(target);
    const isOnField =
      exists.result && exists.place?.name === 'field' && target.destination !== 'trash';

    if (!isOnField) return;

    // TODO: 耐性持ちのチェックをここでやる
    stack.addChildStack('break', source, target);
    target.destination = 'trash';
    stack.core.room.soundEffect('bang');
  }
}
