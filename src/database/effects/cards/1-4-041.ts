import type { Stack } from '@/package/core/class/stack';
import { EffectTemplate, System, EffectHelper } from '..';
import master from '@/database/catalog';

export const effects = {
  checkDrive: (stack: Stack): boolean => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    // 召喚者とこのカードの所有者が一致しているか確認する
    const driver = EffectHelper.owner(stack.core, stack.source);
    const player = EffectHelper.owner(stack.core, stack.processing);
    const isSamePlayer = driver.id === player.id;

    // 召喚者のフィールドに4属性揃っているか確認する
    const colors = [...new Set(player.field.map(unit => master.get(unit.catalogId)!.color))].length;
    const isGreaterThan4Colors = colors >= 4;

    return isSamePlayer && isGreaterThan4Colors;
  },

  onDrive: async (stack: Stack) => {
    // Make sure processing is defined
    if (!stack.processing) throw new Error('Stack processing is undefined');

    const player = EffectHelper.owner(stack.core, stack.processing);
    await System.show(stack, 'フラワーアレンジメント', 'カードを2枚引く');
    [...Array(2)].forEach(() => EffectTemplate.draw(player, stack.core));
  },
};
