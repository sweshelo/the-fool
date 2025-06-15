import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

// 鳳仙華の舞の効果を発動する
const activateHosenkaNoMai = async (stack: StackWithCard, target: Unit) => {
  const owner = target.owner;
  const dancerCount = owner.field.filter(unit => unit.catalog.species?.includes('舞姫')).length;
  const damage = dancerCount * 1000;

  Effect.damage(stack, stack.processing, target, damage);
};

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    if (opponentUnits.length > 0) {
      await System.show(
        stack,
        '援軍／舞姫&鳳仙花の舞',
        '【舞姫】ユニットを1枚引く\n[【舞姫】×1000]ダメージ'
      );
      const [selectedUnit] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        opponentUnits,
        'ダメージを与えるユニットを選択',
        1
      );
      if (!selectedUnit) {
        return;
      }
      await activateHosenkaNoMai(stack, selectedUnit);
    } else {
      await System.show(stack, '援軍／舞姫', '【舞姫】ユニットを1枚引く');
    }
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '舞姫' });
  },

  onDrive: async (stack: StackWithCard) => {
    const target = stack.target;
    if (!(target instanceof Unit) || target.catalog.species?.includes('舞姫') === false) {
      return;
    }

    // 自身の場合は除外
    if (target.id === stack.processing.id) {
      return;
    }

    // 対戦相手のユニットを1体選ぶ
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== target.owner.id,
      target.owner
    );
    if (opponentUnits.length === 0) {
      return;
    }

    await System.show(stack, '鳳仙華の舞', `[【舞姫】×1000]ダメージ`);

    const [selectedUnit] = await EffectHelper.selectUnit(
      stack,
      target.owner,
      opponentUnits,
      'ダメージを与えるユニットを選択',
      1
    );
    if (!selectedUnit) {
      return;
    }

    await activateHosenkaNoMai(stack, selectedUnit);
  },
};
