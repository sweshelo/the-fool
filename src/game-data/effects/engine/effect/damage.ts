import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import { Delta } from '@/package/core/class/delta';
import { createMessage } from '@/submodule/suit/types';
import { effectBreak } from './break';

export function effectDamage(
  stack: Stack,
  source: Card,
  target: Unit,
  value: number,
  type: 'effect' | 'battle' = 'effect',
  effectCode: string = `${source.id}-${stack.type}`
): boolean | undefined {
  const exists = target.owner.find(target);
  const isOnField = exists.result && exists.place?.name === 'field';
  if (!isOnField) throw new Error('対象が見つかりませんでした');

  if (target.destination !== undefined) {
    stack.addChildStack('damage', source, target, {
      type: 'damage',
      cause: type,
      value,
    });
    return false;
  }

  const damage = type === 'effect' && target.hasKeyword('オーバーヒート') ? value * 2 : value;

  const hasImmotal = target.hasKeyword('不滅');
  const hasOrderShield =
    target.hasKeyword('秩序の盾') && type === 'effect' && source.owner.id !== target.owner.id;
  const hasKingsHealing = target.hasKeyword('王の治癒力') && target.currentBP > damage;
  if (hasImmotal || hasOrderShield || hasKingsHealing) {
    stack.core.room.soundEffect('block');
    return false;
  }

  if (
    !target.hasKeyword('沈黙') &&
    target.catalog.name === '戦女神ジャンヌダルク' &&
    type === 'effect'
  ) {
    stack.core.room.soundEffect('block');
    stack.core.room.broadcastToAll(
      createMessage({
        action: {
          type: 'effect',
          handler: 'client',
        },
        payload: {
          type: 'VisualEffect',
          body: {
            effect: 'status',
            type: 'base-bp',
            value: damage,
            unitId: target.id,
          },
        },
      })
    );
    target.bp += damage;
    return false;
  }

  stack.core.room.broadcastToAll(
    createMessage({
      action: {
        type: 'effect',
        handler: 'client',
      },
      payload: {
        type: 'VisualEffect',
        body: {
          effect: 'status',
          type: 'damage',
          value: damage,
          unitId: target.id,
        },
      },
    })
  );

  target.delta.push(
    new Delta(
      { type: 'damage', value: damage },
      {
        event: 'turnEnd',
        count: 1,
        source: {
          effectCode,
          unit: source.id,
        },
      }
    )
  );

  stack.addChildStack('damage', source, target, {
    type: 'damage',
    cause: type,
    value: damage,
  });

  if (type !== 'battle') {
    stack.core.room.soundEffect('damage');
  }

  if (target.currentBP <= 0) {
    effectBreak(stack, source, target, 'damage');
    return true;
  }

  return false;
}
