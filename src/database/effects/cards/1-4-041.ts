import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { ICard } from '@/submodule/suit/types';
import { EffectTemplate } from '../../templates';
import { EffectHelper } from '../helper';
import master from '@/database/catalog';

export const effects = {
  checkDrive: (stack: Stack, card: ICard, core: Core): boolean => {
    // 召喚者とこのカードの所有者が一致しているか確認する
    const driver = EffectHelper.owner(core, stack.source);
    const player = EffectHelper.owner(core, card);
    const isSamePlayer = driver.id === player.id;

    // 召喚者のフィールドに4属性揃っているか確認する
    const colors = [...new Set(player.field.map(unit => master.get(unit.catalogId)!.color))].length;
    const isGreaterThan4Colors = colors >= 4;

    return isSamePlayer && isGreaterThan4Colors;
  },

  onDrive: async (stack: Stack, card: ICard, core: Core) => {
    const player = EffectHelper.owner(core, card);
    await stack.displayEffect(core, 'フラワーアレンジメント', 'カードを2枚引く');
    [...Array(2)].forEach(() => EffectTemplate.draw(player, core));
  },
};
