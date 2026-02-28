import type { Card } from '@/package/core/class/card';
import { Delta, type DeltaConstructorOptionParams } from '@/package/core/class/delta';
import type { Stack } from '@/package/core/class/stack';

export function effectBan(
  _stack: Stack,
  _source: Card,
  target: Card,
  option?: DeltaConstructorOptionParams
) {
  // カードが操作可能領域にあるか
  const isInOperableArea =
    target.owner.hand.some(card => card.id === target.id) ||
    target.owner.trigger.some(card => card.id === target.id);
  if (!isInOperableArea) return;

  // Deltaを作成
  const delta = new Delta({ type: 'banned' }, option);
  target.delta.push(delta);
}
