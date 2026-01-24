import type { Card } from '@/package/core/class/card';
import type { Player } from '@/package/core/class/Player';
import type { Stack } from '@/package/core/class/stack';
import type { Choices } from '@/submodule/suit/types/game/system';
import { System } from '../system';

export async function helperSelectCard<T extends Card = Card>(
  stack: Stack,
  player: Player,
  targets: T[],
  title: string,
  count: number = 1
): Promise<[T, ...T[]]> {
  const choices: Choices = {
    title,
    type: 'card',
    items: targets,
    count,
  };
  const response = await System.prompt(stack, player.id, choices);
  const result = targets.filter(card => response.includes(card.id));

  // oxlint-disable-next-line no-unsafe-type-assertion
  if (result.length > 0) return result as [T, ...T[]];
  throw new Error('選択すべきカードが見つかりませんでした');
}
