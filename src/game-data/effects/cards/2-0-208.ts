import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 【加護】
  // ■選略・光竜の双哮
  // このユニットがフィールドに出た時、以下の効果から1つを選び発動する。
  // ①：対戦相手の全てのユニットに【呪縛】を与える。
  // ②：対戦相手のコスト3以上の全てのユニットの行動権を消費する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    const opponentUnits = opponent.field;

    // 選略効果の実装
    if (opponentUnits.length > 0) {
      const choice = await EffectHelper.choice(stack, stack.processing.owner, '選略・光竜の双哮', [
        { id: '1', description: '敵全体に【呪縛】を与える' },
        {
          id: '2',
          description: 'コスト3以上の敵の行動権を消費',
          condition: opponentUnits.filter(unit => unit.catalog.cost >= 3).length > 0,
        },
      ]);

      switch (choice) {
        case '1': {
          // ①：対戦相手の全てのユニットに【呪縛】を与える
          await System.show(stack, '選略・光竜の双哮', '敵全体に【呪縛】を与える');

          opponentUnits.forEach(unit => {
            Effect.keyword(stack, stack.processing, unit, '呪縛');
          });
          break;
        }
        case '2': {
          // ②：対戦相手のコスト3以上の全てのユニットの行動権を消費する
          await System.show(stack, '選略・光竜の双哮', 'コスト3以上の行動権を消費');

          opponentUnits
            .filter(unit => unit.catalog.cost >= 3)
            .forEach(unit => {
              Effect.activate(stack, stack.processing, unit, false);
            });
          break;
        }
      }
    }

    // 選略効果の後に、別途【加護】を与える
    await System.show(stack, '加護', '効果に選ばれない');
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },
};
