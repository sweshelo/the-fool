# カード効果実装例

このドキュメントでは、よくあるカード効果の実装例を紹介します。

## 目次

1. [基本的な効果](#基本的な効果)
2. [ユニット選択効果](#ユニット選択効果)
3. [永続効果](#永続効果)
4. [複数イベント効果](#複数イベント効果)
5. [トリガー効果](#トリガー効果)
6. [条件付き効果](#条件付き効果)
7. [選略・選告効果](#選略選告効果)

---

## 基本的な効果

### 例1: 召喚時にカードをドローする

```typescript
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'カード名', 'カードを1枚引く');
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
```

### 例2: 召喚時に複数枚ドローする

```typescript
export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'カード名', 'カードを3枚引く');
    [...Array(3)].forEach(() => {
      EffectTemplate.draw(stack.processing.owner, stack.core);
    });
  },
};
```

### 例3: 召喚時にキーワード能力を付与

```typescript
import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'カード名', '【迅速】付与');
    Effect.keyword(stack, stack.processing, stack.processing, '迅速');
  },
};
```

---

## ユニット選択効果

### 例4: 相手のユニットを1体選んで手札に戻す

```typescript
import { Unit } from '@/package/core/class/card';
import { Effect, System, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 相手のフィールドにユニットが存在するか確認
    if (opponent.field.length === 0) return;

    await System.show(stack, 'ジャンプーダンス', '手札に戻す');

    // ユニット選択（System.prompt を直接使用）
    const [choiceId] = await System.prompt(stack, owner.id, {
      title: '手札に戻すユニットを選択',
      type: 'unit',
      items: opponent.field,
    });

    const target = opponent.field.find(unit => unit.id === choiceId) ?? opponent.field[0];
    if (!target) throw new Error('対戦相手のフィールドにユニットが存在しません');

    Effect.bounce(stack, stack.processing, target, 'hand');
  },
};
```

### 例5: 相手のLv2以上のユニットを1体選んで破壊

```typescript
export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 選択可能なユニットが存在するかチェック
    if (!EffectHelper.isUnitSelectable(
      stack.core,
      unit => unit.owner.id === opponent.id && unit.lv >= 2,
      owner
    )) return;

    await System.show(stack, 'カード名', '破壊');

    // ユニット選択
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      unit => unit.owner.id === opponent.id && unit.lv >= 2,
      '破壊するユニットを選択'
    );

    // 効果実行
    Effect.break(stack, stack.processing, target);
  },
};
```

### 例6: ランダムに相手のユニットを1体破壊

```typescript
export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const opponent = stack.processing.owner.opponent;

    // 相手のフィールドにユニットが存在しない場合は発動しない
    if (opponent.field.length === 0) return;

    await System.show(stack, 'カード名', 'ランダムに破壊');

    // ランダムに1体選択
    const [target] = EffectHelper.random(opponent.field);

    // 破壊
    Effect.break(stack, stack.processing, target);
  },
};
```

---

## 永続効果

### 例7: フィールドにいる間、自身のBPを+1000

```typescript
export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'カード名', 'BP+1000');
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack, stack.processing, {
      effect: (target, source) => {
        // 型チェックを実施
        // ※それ以外の条件は condition に実装します
        if (target instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, target, 1000, { source })
        }
      },
      effectCode: '効果名'
      targets: ['self'], // 対象が自身のみならば 'self'
    })
  }
};
```

### 例8: フィールドの【神】1体につき自身のBPを+4000

フィールドの状況に応じて効果量が変動する場合、`Effect.modifyBP` の代わりに `Effect.dynamicBP` を利用し、計算式を登録します。

```typescript
export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '闘士／神', '【神】1体につきBP+4000');
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack, stack.processing, {
      effect: (target, source) => {
        // 型チェックを実施
        // ※それ以外の条件は condition に実装します
        if (target instanceof Unit) {
          Effect.dynamicBP(stack, stack.processing, target, target.owner.field.filter(unit => unit.catalog.species.includes('神')).length * 4000, { source })
        }
      },
      effectCode: '闘士／神'
      targets: ['self'], // 対象が自身のみならば 'self'
    })
  }
};
```

---

## 複数イベント効果

### 例9: 召喚時とターン開始時に効果を発動

```typescript
export const effects: CardEffects = {
  // 召喚時に【不屈】付与
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '不屈', 'ターン終了時に行動権を回復');
    Effect.keyword(stack, stack.processing, stack.processing, '不屈', {
      source: { unit: stack.processing.id },
    });
  },

  // 自分のターン開始時に行動権を消費
  onTurnStart: async (stack: StackWithCard<Unit>) => {
    // 自分のターン開始時のみ
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      await System.show(stack, '平和の象徴', '行動権を消費');
      Effect.activate(stack, stack.processing, stack.processing, false);
    }
  },
};
```

### 例10: 複雑な複数イベント効果

```typescript
export const effects: CardEffects = {
  // 召喚時
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'カード名', 'BP+2000');
    Effect.modifyBP(stack, stack.processing, stack.processing, 2000, {
      event: 'turnEnd',
      count: 1
    });
  },

  // 自分のターン終了時
  onTurnEnd: async (stack: StackWithCard<Unit>) => {
    // 相手のターン終了時
    if (stack.processing.owner.id !== stack.core.getTurnPlayer().id) {
      // 自身のレベルが2以上の場合
      if (stack.processing.lv >= 2) {
        // 選択可能なユニットが存在するかチェック
        if (!EffectHelper.isUnitSelectable(
          stack.core,
          'owns',
          stack.processing.owner
        )) return;

        await System.show(stack, '争いの追憶', 'ユニットを消滅');

        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'owns',
          '消滅させるユニットを選択'
        );

        Effect.delete(stack, stack.processing, target);
      }
    }
  },
};
```

---

## トリガー効果

### 例11: 自分のライフが3以下の時、ユニット召喚時にカードを3枚引く

```typescript
import { Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ユニット召喚時（他のユニットの召喚も含む）
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '一筋の光明', 'カードを3枚引く');
    [...Array(3)].forEach(() => {
      EffectTemplate.draw(stack.processing.owner, stack.core);
    });
  },

  // 発動条件判定
  checkDrive: (stack: StackWithCard) => {
    return (
      // 自分のライフが3以下
      stack.processing.owner.life.current <= 3 &&
      // 召喚されたのがユニット
      stack.source instanceof Unit &&
      // 自分のユニットが召喚された時
      stack.processing.owner.id === stack.source.owner.id
    );
  },
};
```

### 例12: 他のユニット召喚時に効果を発動

```typescript
export const effects: CardEffects = {
  // 他のユニット召喚時
  onDrive: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const target = stack.target instanceof Unit ? stack.target : undefined;

    // 対象が進化ユニットでない、または対戦相手のユニットでない場合は発動しない
    if (
      !target ||
      target.catalog.type !== 'advanced_unit' ||
      target.owner.id !== self.owner.opponent.id
    ) {
      return;
    }

    await System.show(stack, '聖吹のシンフォニー', '行動権消費');

    // 対戦相手の全てのユニットの行動権を消費
    target.owner.field.forEach(unit => {
      Effect.activate(stack, self, unit, false);
    });
  },
};
```

---

## 条件付き効果

### 例13: レベルに応じて効果が変わる

```typescript
export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const opponent = self.owner.opponent;

    // 選択可能なユニットが存在するかチェック
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', self.owner)) return;

    // レベルに応じてダメージ量が変わる
    const damage = self.lv === 1 ? 3000 : self.lv === 2 ? 5000 : 7000;

    await System.show(stack, 'カード名', `${damage}ダメージ`);

    const [target] = await EffectHelper.pickUnit(
      stack,
      self.owner,
      'opponents',
      'ダメージを与えるユニットを選択'
    );

    Effect.damage(stack, self, target, damage);
  },
};
```

### 例14: フィールドの状況に応じて効果が変わる

```typescript
export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    // 自分のフィールドにユニットが4体以下の場合のみ発動
    if (owner.field.length > 4) return;

    // 捨札から条件に合うユニットを探す
    const targets = owner.trash.filter(card =>
      card instanceof Unit &&
      card.catalog.type !== 'advanced_unit' &&
      card.catalog.cost <= 7 &&
      card.catalog.color === Color.BLUE
    );

    if (targets.length === 0) return;

    await System.show(stack, 'カード名', '捨札から【特殊召喚】\nレベル+2');

    // カード選択
    const [card] = await EffectHelper.selectCard(
      stack,
      owner,
      targets,
      '特殊召喚するユニットを選択'
    );

    if (card instanceof Unit) {
      // 特殊召喚
      await Effect.summon(stack, self, card);

      // レベル+2
      card.lv += 2;
    }
  },
};
```

---

## 選略・選告効果

### 例15: 選略（プレイヤーが選択）

```typescript
export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 選略[1]は、相手にLv3以上のユニットが存在しないと発動できない
    const canOption1 = opponent.field.some(u => u.lv >= 3);

    // 選択肢の提示（どちらか一方しか選択できない場合は自動選択）
    const [choice] = canOption1
      ? await System.prompt(stack, owner.id, {  // 選略: owner.id
          title: '選略・空間を統べる覇者',
          type: 'option',
          items: [
            { id: '1', description: '敵全体のレベル3以上のユニットを破壊' },
            { id: '2', description: '敵全体に【沈黙】を与える' },
          ],
        })
      : ['2'];  // 選択肢[1]が選べない場合は[2]を自動選択

    // 選択に応じた効果を実行
    if (choice === '1') {
      await System.show(stack, 'カード名', 'Lv3以上破壊');

      // Lv3以上のユニットを全て破壊
      opponent.field
        .filter(unit => unit.lv >= 3)
        .forEach(unit => Effect.break(stack, stack.processing, unit));
    } else {
      await System.show(stack, 'カード名', '【沈黙】付与');

      // 全てのユニットに【沈黙】を付与
      opponent.field.forEach(unit => {
        Effect.keyword(stack, stack.processing, unit, '沈黙', {
          event: 'turnEnd',
          count: 1
        });
      });
    }
  },
};
```

### 例16: 選告（対戦相手が選択）

```typescript
export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    const canOption1 = /* 条件 */;
    const canOption2 = /* 条件 */;

    let choice: string;
    if (canOption1 && canOption2) {
      // 両方選べる場合は対戦相手に選ばせる
      [choice] = await System.prompt(stack, opponent.id, {  // 選告: opponent.id
        title: '選告・カード名',
        type: 'option',
        items: [
          { id: '1', description: '効果1の説明' },
          { id: '2', description: '効果2の説明' },
        ],
      });
    } else if (canOption1) {
      choice = '1';
    } else if (canOption2) {
      choice = '2';
    } else {
      return;  // どちらも選べない場合は発動しない
    }

    // 選択に応じた効果を実行
    if (choice === '1') {
      await System.show(stack, 'カード名', '効果1');
      // 実装
    } else {
      await System.show(stack, 'カード名', '効果2');
      // 実装
    }
  },
};
```

---

## その他のパターン

### 例17: 自身以外の全てのユニットに効果を適用

```typescript
export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;

    await System.show(stack, 'カード名', '全体BP-1000');

    // 自身以外の全てのユニットのBPを-1000
    EffectHelper.exceptSelf(stack.core, self, (unit) => {
      Effect.modifyBP(stack, self, unit, -1000, {
        event: 'turnEnd',
        count: 1
      });
    });
  },
};
```

### 例18: プレイヤーアタック成功時に効果を発動

```typescript
export const effects: CardEffects = {
  onPlayerAttack: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const opponent = self.owner.opponent;

    // 対戦相手のフィールドにユニットが存在しない場合は発動しない
    if (
      opponent.field.length === 0 ||
      !(stack.source instanceof Unit) ||
      stack.source.owner.id !== self.owner.opponent.id
    ) {
      return;
    }

    // レベル2以上のユニットが存在するか確認
    if (!EffectHelper.isUnitSelectable(
      stack.core,
      unit => unit.lv >= 2 && unit.owner.id === opponent.id,
      self.owner
    )) return;

    await System.show(stack, '光の守護精霊', '手札に戻す');

    // 対戦相手のレベル2以上のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      self.owner,
      unit => unit.lv >= 2 && unit.owner.id === opponent.id,
      '手札に戻すユニットを選んでください'
    );

    Effect.bounce(stack, self, target, 'hand');
  },
};
```

---

## デバッグのヒント

### console.log の活用

開発中は `console.log` を使用してデバッグできます：

```typescript
onDriveSelf: async (stack: StackWithCard<Unit>) => {
  console.log('自分のレベル:', stack.processing.lv);
  console.log('相手のユニット数:', stack.processing.owner.opponent.field.length);

  // 効果の実装
};
```

### 条件分岐のデバッグ

```typescript
// フィルタ関数内でデバッグ出力
const filter = (unit: Unit) => {
  const isOpponent = unit.owner.id === opponent.id;
  const isLv2OrMore = unit.lv >= 2;

  console.log(`ユニット ${unit.catalog.name}: 相手=${isOpponent}, Lv2以上=${isLv2OrMore}`);

  return isOpponent && isLv2OrMore;
};

// 選択可能かチェック
if (!EffectHelper.isUnitSelectable(stack.core, filter, owner)) return;

// ユニット選択
const [target] = await EffectHelper.pickUnit(stack, owner, filter, '対象を選択');
```

---

## 次のステップ

- [カード効果実装ガイド](./implementation-guide.md) - 実装の詳細ルール
- [API リファレンス](./api-reference.md) - 利用可能な関数とクラスの詳細

## 関連ドキュメント

- [アーキテクチャ](../architecture.md)
- [環境構築](../getting-started.md)
