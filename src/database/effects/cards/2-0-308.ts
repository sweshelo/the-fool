import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';
import { EffectHelper } from '../classes/helper';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing as Unit;
    const owner = self.owner;

    // 選択肢1の対象（行動権のあるユニット）を探す
    const activeUnits = owner.opponent.field.filter(unit => unit.active);

    // 選択肢2の対象（行動済ユニット）を探す
    const usedUnits = owner.opponent.field.filter(unit => !unit.active);

    // どちらも選べない場合は効果をキャンセル
    if (activeUnits.length === 0 && usedUnits.length === 0) return;

    // 片方しか選べない場合は自動で発動
    if (activeUnits.length === 0) {
      await applyEffect(stack, self, usedUnits, '2');
      return;
    }

    if (usedUnits.length === 0) {
      await applyEffect(stack, self, activeUnits, '1');
      return;
    }

    // 両方選べる場合は選択肢を表示
    const choices = [
      { id: '1', description: '行動権を消費する' },
      { id: '2', description: '【呪縛】を与える' },
    ];

    const [response] = await System.prompt(stack, owner.id, {
      type: 'option',
      title: '選略・妖艶の夜光',
      items: choices,
    });

    if (response)
      await applyEffect(
        stack,
        self,
        response === '1' ? activeUnits : usedUnits,
        response as '1' | '2'
      );
  },
};

// 効果適用の共通処理
async function applyEffect(
  stack: StackWithCard<Unit>,
  self: Unit,
  targets: Unit[],
  effectType: '1' | '2'
) {
  const [target] = EffectHelper.random(targets, 1);
  if (!target) return;

  switch (effectType) {
    case '1':
      await System.show(stack, '選略・妖艶の夜光', '行動権を消費する');
      Effect.activate(stack, self, target, false);
      break;
    case '2':
      await System.show(stack, '選略・妖艶の夜光', '【呪縛】を与える');
      Effect.keyword(stack, self, target, '呪縛');
  }
}
