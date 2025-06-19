import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ターン終了時の効果
  onTurnEnd: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン終了時のみ
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      const purpleGauge = stack.processing.owner.purple ?? 0;
      if (purpleGauge <= 0) {
        await System.show(stack, '七精霊の加護', '紫ゲージ+1');
        await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
      }
    }
  },

  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    const purpleGauge = owner.purple ?? 0;

    if (purpleGauge === 0) return;

    // 対戦相手のユニットを紫ゲージ×1以下のコストでフィルタ
    const destroyableUnits = opponent.field.filter(unit => unit.catalog.cost <= purpleGauge);

    // 選択肢を提示（②が実行可能かどうかで自動選択する場合もある）
    const [choice] =
      destroyableUnits.length > 0 && purpleGauge > 0
        ? await System.prompt(stack, owner.id, {
            title: '選略・ピュアホワイトスピア',
            type: 'option',
            items: [
              { id: '1', description: '効果なし' },
              { id: '2', description: `敵全体のコスト[紫ゲージ×1]以下を破壊\n紫ゲージを全て消費` },
            ],
          })
        : ['1'];

    switch (choice) {
      case '1':
        // 効果なし
        await System.show(stack, '選略・ピュアホワイトスピア', '効果なし');
        break;

      case '2':
        await System.show(
          stack,
          '選略・ピュアホワイトスピア',
          `敵全体のコスト[紫ゲージ×1]以下を破壊\n紫ゲージを全て消費`
        );

        // 対象ユニットを破壊
        destroyableUnits.forEach(unit => {
          Effect.break(stack, stack.processing, unit);
        });

        // 紫ゲージを全て消費
        await Effect.modifyPurple(stack, stack.processing, owner, -purpleGauge);
        break;
    }
  },
};
