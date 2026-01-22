import type { Stack } from '@/package/core/class/stack';
import type { Unit } from '@/package/core/class/card';
import type { KeywordEffect } from '@/submodule/suit/types';
import type { KeywordOptionParams } from './types';

export function effectRemoveKeyword(
  stack: Stack,
  target: Unit,
  keyword: KeywordEffect,
  option?: KeywordOptionParams
) {
  if (option) {
    target.delta = target.delta.filter(
      delta =>
        !(
          delta.effect.type === 'keyword' &&
          delta.effect.name === keyword &&
          (!option.source || delta.source?.unit === option.source.unit)
        )
    );
  } else {
    target.delta = target.delta.filter(
      delta => !(delta.effect.type === 'keyword' && delta.effect.name === keyword)
    );
  }

  switch (keyword) {
    case '沈黙':
      stack.core.room.soundEffect('grow');
      break;
  }
}
