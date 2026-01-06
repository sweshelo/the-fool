import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  //■選略・サプライズアップ
  //このユニットがフィールドに出た時、以下の効果から1つを選び発動する。
  //①：効果なし
  //②：このユニットを破壊する。あなたのユニットを1体選ぶ。それに【加護】を与える。

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    //自身以外の味方ユニットをフィルタリング
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === owner.id && unit.id !== self.id,
      owner
    );

    // 選略[2]は、選択可能なユニットが1体以上いる場合のみ選択可能
    const canOption2 = candidates.length >= 1;

    // 選択肢の提示（どちらか一方しか選択できない場合は自動選択）
    const [choice] = canOption2
      ? await System.prompt(stack, owner.id, {
          // 選略: owner.id
          title: '選略・サプライズアップ',
          type: 'option',
          items: [
            { id: '1', description: '効果なし' },
            { id: '2', description: '自身を破壊\n味方1体に【加護】を付与。' },
          ],
        })
      : ['1']; // 選択肢[2]が選べない場合は[1]を自動選択

    if (choice === '2') {
      await System.show(stack, '選略・サプライズアップ', '自身を破壊\n味方1体に【加護】を付与');

      const [target] = await EffectHelper.selectUnit(
        stack,
        owner,
        candidates,
        '【加護】を与えるユニットを1体選択して下さい'
      );

      //【加護】を与える
      Effect.keyword(stack, self, target, '加護');

      //自身を破壊
      Effect.break(stack, self, self);
    }
  },
};
