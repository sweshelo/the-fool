import { EffectHelper, EffectTemplate, System } from '..';
import master from '@/database/catalog';
import type { StackWithCard } from '../classes/types';
import { Card } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant';

export const effects = {
  checkDrive: (stack: StackWithCard): boolean => {
    if (!(stack.target instanceof Card)) return false;

    // 召喚者とこのカードの所有者が一致しているか確認する
    const driver = stack.target.owner;
    const player = stack.processing.owner;
    const isSamePlayer = driver.id === player.id;

    // 召喚者のフィールドに4属性揃っているか確認する
    const colors = new Set(
      player.field
        .map(unit => master.get(unit.catalogId)?.color)
        .filter(color => color !== Color.NONE)
    ).size;
    const isGreaterThan4Colors = colors >= 4;

    return isSamePlayer && isGreaterThan4Colors;
  },

  onDrive: async (stack: StackWithCard) => {
    const player = stack.processing.owner;
    await System.show(stack, 'フラワーアレンジメント', 'カードを2枚引く');
    EffectHelper.repeat(2, () => EffectTemplate.draw(player, stack.core));
  },
};
