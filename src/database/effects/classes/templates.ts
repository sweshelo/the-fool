import type { Player } from '@/package/core/class/Player';
import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import master from '@/submodule/suit/catalog/catalog';
import type { Choices } from '@/submodule/suit/types/game/system';
import { System } from './system';
import { EffectHelper } from './helper';
import { Effect } from './effect';

interface ReinforcementMatcher {
  color?: number;
  species?: string;
}

export class EffectTemplate {
  static draw(player: Player, core: Core): void {
    // 手札が上限に達している場合は何もしない
    if (player.hand.length >= core.room.rule.player.max.hand) return;

    player.draw();
    core.room.soundEffect('draw');
    return;
  }

  /**
   * [リバイブ]効果
   * @param count 回収する枚数
   */
  static async revive(stack: Stack, count: number = 1): Promise<void> {
    // 召喚者特定
    const driver = EffectHelper.owner(stack.core, stack.processing);

    if (!driver) return;

    // 召喚者に対して ChoisePayload を送信
    const choices: Choices = {
      title: '手札に加えるカードを選択してください',
      type: 'card',
      items: driver?.trash ?? [],
      count,
    };
    const [response] = await System.prompt(stack, driver.id, choices);
    console.log('response', response);

    // 召喚者の手札が上限に達している場合は何もしない
    if (driver?.hand === undefined || driver?.hand?.length >= stack.core.room.rule.player.max.hand)
      return;

    const target = driver.trash.find(c => c.id === response);
    console.log('target', target);

    // targetを引き抜き、手札に加える
    if (target && stack.processing) {
      Effect.move(stack, stack.processing, target, 'hand');
    }
    return;
  }

  /**
   * [援軍]効果
   * @param player ドローするプレイヤー
   * @param match サーチする条件
   * @returns void
   */
  static reinforcements(stack: Stack, player: Player, match: ReinforcementMatcher): void {
    // 召喚者の手札が上限に達している場合は何もしない
    if (player.hand === undefined || player.hand.length >= stack.core.room.rule.player.max.hand)
      return;

    // 召喚者のデッキから条件に合致するカードを探す
    const target = player.deck.find(c => {
      const catalog = master.get(c.catalogId);
      if (!catalog || (catalog.type !== 'unit' && catalog.type !== 'advanced_unit')) return false;

      // 色の一致
      const colorMatch = match.color ? catalog.color === match.color : true;
      // 種族の一致
      const speciesMatch = match.species ? catalog.species?.includes(match.species) : true;
      return colorMatch && speciesMatch;
    });

    // targetを引き抜き、手札に加える
    if (target && stack.processing) {
      Effect.move(stack, stack.processing, target, 'hand');
    }

    return;
  }
}
