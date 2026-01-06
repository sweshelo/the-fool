import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  //■起動・霊猫の王
  //あなたの【獣】を1体選び、基本BPを-2000し、【スピードムーブ】を与える。
  //■選略・霊猫鋼球乱舞
  //このユニットが出た時以下の効果が発動する。
  //①：対戦相手の行動権のあるユニットからランダムで1体に【強制防御】を与える。
  //②：CPを-2する。相手ユニットからランダムで1体の基本BPを-3000する。これをあなたの【獣】ユニットの数繰り返す。
  //このユニットがクロックアップした時、このユニットの行動権を回復する。

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    //対戦相手の行動権のあるユニットをフィルタリング
    const inactiveUnits = opponent.field.filter(unit => unit.active);

    //選択肢1は、行動権のあるユニットが1体以上いる場合のみ選択可能
    const canOption1 = inactiveUnits.length > 0;

    //選択肢2は、CPが2以上あり、相手フィールドにユニットが1体以上いる場合のみ選択可能
    const canOption2 = owner.cp.current >= 2 && opponent.field.length > 0;

    //どちらも選べない場合は効果をキャンセル
    if (!canOption1 && !canOption2) return;

    let choice: string[];
    //選択肢の提示（どちらか一方しか選択できない場合は自動選択）
    if (canOption1 && canOption2) {
      choice = await System.prompt(stack, owner.id, {
        // 選略: owner.id
        title: '選略・霊猫鋼球乱舞',
        type: 'option',
        items: [
          {
            id: '1',
            description: '相手の行動権のあるユニットからランダム1体に【強制防御】を付与。',
          },
          {
            id: '2',
            description:
              'CP-2 相手ユニットからランダム1体の基本BP-3000 【獣】ユニットの数繰り返す。',
          },
        ],
      });
    } else if (canOption1) {
      choice = ['1'];
    } else {
      choice = ['2'];
    }

    if (choice[0] === '1') {
      await System.show(
        stack,
        '選略・霊猫鋼球乱舞',
        '相手の行動権のあるユニットから\nランダム1体に【強制防御】を付与'
      );

      //ランダムに1体選択して【強制防御】を与える
      EffectHelper.random(inactiveUnits, 1).forEach(unit =>
        Effect.keyword(stack, self, unit, '強制防御')
      );
    } else {
      await System.show(
        stack,
        '選略・霊猫鋼球乱舞',
        'CP-2 相手ユニットからランダム1体の基本BP-3000\n【獣】ユニットの数繰り返す。'
      );

      //CPを-2する
      Effect.modifyCP(stack, self, owner, -2);

      //あなたの【獣】ユニットの数を取得（Unitであることを確認して安全にカウント）
      const beastUnitsCount = owner.field.filter(
        unit => unit instanceof Unit && (unit.catalog.species?.includes('獣') ?? false)
      ).length;

      //相手ユニットからランダムで1体の基本BPを-3000する。【獣】ユニットの数繰り返す。
      for (let i = 0; i < beastUnitsCount; i++) {
        //相手フィールドのユニットがいない場合は終了
        if (opponent.field.length === 0) break;

        EffectHelper.random(opponent.field, 1).forEach(unit =>
          Effect.modifyBP(stack, self, unit, -3000, { isBaseBP: true })
        );
      }
    }
  },

  isBootable(core: Core, self: Unit): boolean {
    return (
      self.owner.field.filter(
        unit => unit instanceof Unit && (unit.catalog.species?.includes('獣') ?? false)
      ).length > 0
    );
  },

  onBootSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;

    //【獣】ユニットをフィルタリング
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === owner.id && (unit.catalog.species?.includes('獣') ?? false),
      owner
    );

    if (candidates.length === 0) return;

    await System.show(
      stack,
      '起動・霊猫の王',
      '【獣】ユニット1体の基本BP-2000\n【スピードムーブ】を付与'
    );

    const [target] = await EffectHelper.selectUnit(
      stack,
      owner,
      candidates,
      '【獣】ユニットを選択'
    );

    //【スピードムーブ】を付与
    Effect.speedMove(stack, target);
    //基本BPを-2000
    Effect.modifyBP(stack, stack.processing, target, -2000, { isBaseBP: true });
  },

  onClockupSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    await System.show(stack, '霊猫の王', '行動権を回復');
    Effect.activate(stack, self, self, true);
  },
};
