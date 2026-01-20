import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';
import type { Player } from '@/package/core/class/Player';

// 鳳仙華の舞の効果を発動する
const activateHousenkaNoMai = async (
  stack: StackWithCard,
  owner: Player,
  title?: string,
  message?: string
): Promise<boolean> => {
  const filter = (unit: Unit) => unit.owner.id !== owner.id;

  if (!EffectHelper.isUnitSelectable(stack.core, filter, owner)) {
    return false;
  }

  if (title && message) {
    await System.show(stack, title, message);
  }

  const [selectedUnit] = await EffectHelper.pickUnit(
    stack,
    owner,
    filter,
    'ダメージを与えるユニットを選択'
  );

  if (!selectedUnit) {
    return false;
  }

  const dancerCount = owner.field.filter(unit => unit.catalog.species?.includes('舞姫')).length;
  const damage = dancerCount * 1000;
  Effect.damage(stack, stack.processing, selectedUnit, damage);

  return true;
};

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const hasOpponent = await activateHousenkaNoMai(
      stack,
      stack.processing.owner,
      '援軍／舞姫&鳳仙花の舞',
      '【舞姫】ユニットを1枚引く\n[【舞姫】×1000]ダメージ'
    );

    if (!hasOpponent) {
      await System.show(stack, '援軍／舞姫', '【舞姫】ユニットを1枚引く');
    }

    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '舞姫' });
  },

  onDrive: async (stack: StackWithCard) => {
    const target = stack.target;
    if (
      !(target instanceof Unit) ||
      target.catalog.species?.includes('舞姫') === false ||
      target.id === stack.processing.id ||
      stack.source.id === stack.processing.owner.opponent.id
    ) {
      return;
    }

    await activateHousenkaNoMai(stack, target.owner, '鳳仙華の舞', '[【舞姫】×1000]ダメージ');
  },
};
