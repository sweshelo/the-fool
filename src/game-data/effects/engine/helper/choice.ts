import type { Player } from '@/package/core/class/Player';
import type { Stack } from '@/package/core/class/stack';
import { System } from '../system';
import type { Choice } from './types';

export async function helperChoice(
  stack: Stack,
  player: Player,
  title: string,
  choices: [Choice, Choice]
): Promise<Choice['id'] | undefined> {
  const availableChoices = choices.filter(choice => choice.condition?.() ?? true);
  switch (availableChoices.length) {
    case 0:
      return undefined;
    case 1:
      return availableChoices[0]?.id;
    default: {
      const [chosen] = await System.prompt(stack, player.id, {
        type: 'option',
        title,
        items: availableChoices,
      });
      return chosen;
    }
  }
}
