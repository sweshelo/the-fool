import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

const balsamDance = async (stack: StackWithCard, hideMessage = false) => {
  if (
    (!hideMessage && stack.processing.id === stack.target?.id) || // onDriveで自身の召喚効果として処理中 (2回目になるので発動させない)
    !(stack.target instanceof Unit) ||
    !stack.processing.owner.field.find(unit => unit.id == stack.target?.id)
  )
    return;

  // 相手フィールドに選択可能なユニットが存在するか
  const owner = stack.processing.owner;
  const candidate = EffectHelper.candidate(
    stack.core,
    (unit: Unit) => unit.owner.id !== owner.id,
    stack.processing.owner
  );

  if (!hideMessage) await System.show(stack, '鳳仙花の舞', '[【舞姫】×1000]ダメージ');
  const [target] = await EffectHelper.selectUnit(
    stack,
    stack.processing.owner,
    candidate,
    'ダメージを与えるユニットを選択して下さい'
  );

  Effect.damage(
    stack,
    stack.processing,
    target,
    stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('舞姫')).length *
      1000,
    'effect'
  );
};

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const candidate = EffectHelper.candidate(
      stack.core,
      (unit: Unit) => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    if (candidate.length > 0) {
      await System.show(
        stack,
        '鳳仙花の舞＆援軍／舞姫',
        '【舞姫】を1枚引く\n[【舞姫】×1000]ダメージ'
      );
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '舞姫' });
      await balsamDance(stack, true);
    } else {
      await System.show(stack, '援軍／舞姫', '【舞姫】を1枚引く');
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '舞姫' });
    }
  },

  onDrive: balsamDance,
};
