import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { Card } from '@/package/core/class/card';
import { EffectTemplate , System, EffectHelper } from '..';
import master from '@/database/catalog';

export const effects = {
  checkDrive: (stack: Stack, card: Card, core: Core): boolean => {
    // 召喚者とこのカードの所有者が一致しているか確認する
    const driver = EffectHelper.owner(core, stack.source);
    const player = EffectHelper.owner(core, card);
    const isSamePlayer = driver.id === player.id;

    // 召喚者のフィールドに4属性揃っているか確認する
    const colors = [...new Set(player.field.map(unit => master.get(unit.catalogId)!.color))].length;
    const isGreaterThan4Colors = colors >= 4;

    return isSamePlayer && isGreaterThan4Colors;
  },

  onDrive: async (stack: Stack, card: Card, core: Core) => {
    const player = EffectHelper.owner(core, card);
    await System.show(stack, core, 'フラワーアレンジメント', 'カードを2枚引く');
    [...Array(2)].forEach(() => EffectTemplate.draw(player, core));
  },
};
