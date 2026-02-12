import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

async function samuraiBattlEffect(stack: StackWithCard): Promise<void> {
  const owner = stack.processing.owner;
  // 戦闘中の自ユニットを特定
  const ownUnit = [stack.source, stack.target].find(
    (object): object is Unit => object instanceof Unit && object.owner.id === owner.id
  );
  if (!(ownUnit && owner.field.some(unit => unit.id === ownUnit.id))) return;

  if (ownUnit.catalog.species?.includes('侍')) {
    await System.show(stack, '心眼の撫子', '基本BP+1000');
    Effect.modifyBP(stack, stack.processing, ownUnit, 1000, { isBaseBP: true });
  }
}

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(
      stack,
      '援軍／侍＆心眼の撫子',
      '【侍】ユニットを1枚引く\n【侍】に【不屈】を与える'
    );
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '侍' });
  },

  fieldEffect: (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    owner.field.forEach(unit => {
      if (
        unit.catalog.species?.includes('侍') &&
        !unit.delta.some(delta => delta.source?.unit === stack.processing.id)
      ) {
        // 【不屈】を付与
        Effect.keyword(stack, stack.processing, unit, '不屈', {
          source: { unit: stack.processing.id },
        });
      }
    });
  },

  onBattleSelf: samuraiBattlEffect,
  onBattle: async (stack: StackWithCard) => {
    if (stack.source.id === stack.processing.id) return;
    if (stack.target instanceof Unit && stack.target.id === stack.processing.id) return;
    await samuraiBattlEffect(stack);
  },
};
