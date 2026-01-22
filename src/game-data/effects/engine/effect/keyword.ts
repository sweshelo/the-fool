import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import { Delta } from '@/package/core/class/delta';
import type { KeywordEffect } from '@/submodule/suit/types';
import type { KeywordOptionParams } from './types';

export function effectKeyword(
  stack: Stack,
  source: Card,
  target: Unit,
  keyword: KeywordEffect,
  option?: KeywordOptionParams
) {
  if (
    keyword === '沈黙' &&
    target.hasKeyword('沈黙効果耐性') &&
    source.owner.id !== target.owner.id
  ) {
    stack.core.room.soundEffect('block');
    stack.core.room.sync(true);
    return;
  }

  const delta =
    keyword === '次元干渉'
      ? new Delta({ type: 'keyword', name: keyword, cost: option?.cost ?? 0 }, { ...option })
      : new Delta({ type: 'keyword', name: keyword }, { ...option });
  target.delta.push(delta);

  switch (keyword) {
    case '秩序の盾':
    case '不滅':
    case '加護':
    case '王の治癒力':
    case '固着':
    case '破壊効果耐性':
    case '無我の境地':
    case '沈黙効果耐性':
    case '消滅効果耐性':
    case 'セレクトハック':
      stack.core.room.soundEffect('guard');
      break;
    case '貫通':
      stack.core.room.soundEffect('penetrate');
      break;
    case '呪縛':
      stack.core.room.soundEffect('bind');
      break;
    case '不屈':
      stack.core.room.soundEffect('fortitude');
      break;
    case '強制防御':
    case '撤退禁止':
    case '攻撃禁止':
    case '防御禁止':
    case '進化禁止':
      stack.core.room.soundEffect('damage');
      break;
    case '神託':
      stack.core.room.soundEffect('oracle');
      break;
    case '次元干渉':
      stack.core.room.soundEffect('unblockable');
      break;
    case '沈黙':
      stack.core.room.soundEffect('silent');
      stack.core.fieldEffectUnmount(target, stack);
      break;
  }
}
