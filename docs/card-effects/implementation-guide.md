# カード効果実装ガイド

このガイドでは、The Fool でカードの効果を実装する方法を説明します。

## 目次

1. [基本概念](#基本概念)
2. [ファイル構造](#ファイル構造)
3. [イベントとハンドラ](#イベントとハンドラ)
4. [Stack の理解](#stack-の理解)
5. [効果の種類](#効果の種類)
6. [実装ルール](#実装ルール)
7. [テキスト表示](#テキスト表示)
8. [選略・選告](#選略選告)
9. [History の活用](#history-の活用)

## 基本概念

カード効果は以下の構造で実装されます：

```typescript
import type { Unit } from '@/package/core/class/card';
import { Effect, System, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // イベントハンドラを実装
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 効果の実装
  },
};
```

## ファイル構造

### ファイル名

カード効果実装ファイルは、以下の命名規則に従います：

```
src/game-data/effects/cards/[カードID].ts
```

例：

- `1-0-019.ts` - カード ID が "1-0-019" のカード
- `PR-014.ts` - カード ID が "PR-014" のカード

**重要**: ファイル名は `catalog.json` に登録されているカード ID と一致する必要があります。

### 型定義

```typescript
export const effects: CardEffects = {
  // イベントハンドラ
};
```

`CardEffects` 型はイベントハンドラのオブジェクトを定義します。

## イベントとハンドラ

### 主要なイベント

| イベント名     | 説明                           | 使用例           |
| -------------- | ------------------------------ | ---------------- |
| `drive`        | ユニットが召喚された           | `onDrive`        |
| `break`        | ユニットが破壊された           | `onBreak`        |
| `bounce`       | ユニットが手札に戻された       | `onBounce`       |
| `damage`       | ダメージを与える効果が発動した | `onDamage`       |
| `turnStart`    | ターン開始時                   | `onTurnStart`    |
| `overclock`    | オーバークロックした           | `onOverclock`    |
| `playerAttack` | プレイヤーアタックに成功した   | `onPlayerAttack` |

詳細なイベント定義は `src/game-data/effects/schema/events.ts` と `handlers.ts` を参照してください。

### Suffix の活用

イベント名に以下の Suffix を付けることで、発動条件を限定できます：

| Suffix    | 説明                               | 例                   |
| --------- | ---------------------------------- | -------------------- |
| `Self`    | 自分自身がイベントの対象である場合 | `onDriveSelf`        |
| `InTrash` | 自身が捨札にある場合               | `onTurnStartInTrash` |

#### 例

```typescript
export const effects: CardEffects = {
  // 自分が召喚された時
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    // 実装
  },

  // 他のユニットが召喚された時
  onDrive: async (stack: StackWithCard<Unit>) => {
    // 実装
  },
};
```

## Stack の理解

`Stack` は効果の実行コンテキストを表すオブジェクトです。

### Stack の構造

| プロパティ   | 説明                         | 用途                                                 |
| ------------ | ---------------------------- | ---------------------------------------------------- |
| `processing` | 効果を発動しているカード自身 | 自身の Lv 参照、自身への操作                         |
| `source`     | イベントの発生源             | 召喚したプレイヤー、アタックを宣言したプレイヤーなど |
| `target`     | イベントの対象               | 召喚されたユニット、アタックするユニットなど         |
| `core`       | ゲームのコアオブジェクト     | ゲーム全体の状態参照                                 |

### source と target の詳細

各イベントにおける `source` と `target` の具体例：

| イベント       | source                       | target               |
| -------------- | ---------------------------- | -------------------- |
| 召喚（drive）  | 召喚したプレイヤー           | 召喚されたユニット   |
| 破壊（break）  | 破壊効果を発動したカード     | 破壊されたユニット   |
| アタック       | アタックを宣言したプレイヤー | アタックするユニット |
| 戦闘（battle） | アタッカー                   | ブロッカー           |

プレイヤーの操作が介在するイベントでは、概ね `source` にプレイヤーが指定されます。

### 使用例

```typescript
onDriveSelf: async (stack: StackWithCard<Unit>) => {
  const self = stack.processing;         // 自分自身
  const owner = self.owner;              // 自分の所有者（プレイヤー）
  const opponent = owner.opponent;       // 対戦相手

  // 自分のレベルを参照
  if (self.lv >= 2) {
    // ...
  }
}
```

## 効果の種類

### 1. 通常効果（イベントトリガー）

イベントが発生した時に1度だけ実行される効果です。

#### 実装ルール

1. **`System.show()` を必ず呼ぶ**

   効果を発動する前に、`System.show()` でエフェクトテキストを表示します。

2. **条件を事前に確認する**

   `System.show()` を呼ぶ前に、効果を最後まで発動できることを確認します。

3. **if 文は1箇所だけ**

   型ガード的なものを除き、通常効果では if 文は1箇所だけにします。

#### 例：相手のユニットを1体選んで手札に戻す

```typescript
onDriveSelf: async (stack: StackWithCard<Unit>) => {
  const owner = stack.processing.owner;
  const opponent = owner.opponent;

  // 条件確認：選択可能なユニットが存在するか
  if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) return;

  // 効果表示
  await System.show(stack, 'カード名', '手札に戻す');

  // ユニット選択
  const [target] = await EffectHelper.pickUnit(
    stack,
    owner,
    'opponents',
    '手札に戻すユニットを選択'
  );

  // 効果実行
  Effect.bounce(stack, stack.processing, target, 'hand');
}
```

### 2. 永続効果

フィールドや手札にある間、継続的に効果を発揮します。

#### 実装関数

- **`fieldEffect()`** - フィールドにいる間の永続効果
- **`handEffect()`** - 手札にいる間の永続効果

#### 重要な注意点

永続効果は何度も呼び出されるため、**冪等性**を保つ必要があります。
状態を変更する際は **Delta** を使用します。

#### 例：自身の BP を +1000 する

```typescript
fieldEffect: (stack: StackWithCard<Unit>) => {
  const self = stack.processing;

  // 既に発行した Delta が存在するか確認
  const delta = self.delta.find(
    d => d.source.unit === self.id && d.effect.type === 'bp'
  );

  if (delta) {
    // Delta を更新
    delta.effect.diff = 1000;
  } else {
    // Delta を新規作成
    Effect.modifyBP(stack, self, self, 1000, {
      source: { unit: self.id }
    });
  }
}
```

#### Delta の source について

`source: { unit: self.id }` を指定することで、以下が自動的に処理されます：

- 効果元のユニットに【沈黙】が付与された時、Delta が無効化される
- 効果元のユニットがフィールドから離れた時、Delta が除去される

#### 例：条件付きキーワード付与（Lv1 の時に【秩序の盾】を付与）

複数種類の効果を永続効果で提供する場合、`effectCode` で識別します。

```typescript
fieldEffect: (stack: StackWithCard<Unit>) => {
  const self = stack.processing;

  // effectCode で特定の効果を識別
  const delta = self.delta.find(
    d => d.source.unit === self.id && d.source.effectCode === 'Lv1_秩序の盾'
  );

  if (delta) {
    // Lv1 以外になったら効果を除去
    if (self.lv !== 1) {
      self.delta = self.delta.filter(
        d => !(d.source.unit === self.id && d.source.effectCode === 'Lv1_秩序の盾')
      );
    }
  } else {
    // Lv1 の時のみ【秩序の盾】を付与
    if (self.lv === 1) {
      Effect.keyword(stack, self, self, '秩序の盾', {
        source: { unit: self.id, effectCode: 'Lv1_秩序の盾' }
      });
    }
  }
}
```

### 3. 起動効果

プレイヤーが任意のタイミングで発動できる効果です。

#### 実装関数

- **`onBootSelf()`** - 起動効果の実装
- **`isBootable()`** - 起動可能かどうかの判定（必須）

#### 例：起動効果の実装

```typescript
export const effects: CardEffects = {
  // 起動効果
  onBootSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'カード名', '効果内容');
    // 効果の実装
  },

  // 起動可能判定（必須）
  isBootable: (stack: StackWithCard<Unit>): boolean => {
    // 起動できる条件を返す
    return stack.processing.owner.opponent.field.length > 0;
  },
};
```

### 4. 判定関数

特定のイベントに対して効果を発動するかどうかを判定する関数です。

#### 命名規則

インターセプトやトリガーを実装した場合、対応する判定関数を実装する必要があります：

| 関数名       | 説明                                        |
| ------------ | ------------------------------------------- |
| `isBootable` | 起動効果を発動できるか                      |
| `checkXXX`   | アクション「XXX」に対して効果を発動できるか |

#### 例

```typescript
export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard<Unit>) => {
    // 実装
  },

  // onDrive の判定関数
  checkDrive: (stack: StackWithCard<Unit>): boolean => {
    // 発動条件
    const target = stack.target;
    return target instanceof Unit && target.lv >= 2;
  },
};
```

## 実装ルール

### ヘルパークラスの使用

ゲームオブジェクトを直接操作せず、以下のヘルパークラスを使用してください：

- **Effect** - カードの移動、BP 操作、破壊など
- **EffectHelper** - ユニット選択、ランダム処理など
- **System** - 効果表示、プロンプト表示など
- **EffectTemplate** - 頻出効果のテンプレート

詳細は [API リファレンス](./api-reference.md) を参照してください。

### キーワード効果

【】で括られた能力（キーワード効果）は、特に言及がない限り召喚時に付与されます。

```typescript
onDriveSelf: async (stack: StackWithCard<Unit>) => {
  await System.show(stack, 'カード名', '【不屈】付与');

  // 【不屈】を付与
  Effect.keyword(stack, stack.processing, stack.processing, '不屈');
}
```

#### 特殊なキーワード効果

**「ブロックされない」効果**

「ブロックされない」効果は、`'次元干渉'` キーワードを `cost: 0` で付与します。

```typescript
// ブロックされない（次元干渉コスト0）
Effect.keyword(stack, self, self, '次元干渉', { cost: 0 });
```

### ユニットの選択

ユニットを選ぶ効果では、以下の手順を踏みます：

1. **`EffectHelper.isUnitSelectable()`** で選択可能なユニットが存在するかチェック
2. **`EffectHelper.pickUnit()`** でユニットを選択

```typescript
// 選択可能なユニットが存在するかチェック
if (!EffectHelper.isUnitSelectable(
  stack.core,
  unit => unit.owner.id === opponent.id && unit.lv >= 3,
  owner
)) return;

await System.show(stack, 'カード名', '破壊');

// ユニットを選択
const [target] = await EffectHelper.pickUnit(
  stack,
  owner,
  unit => unit.owner.id === opponent.id && unit.lv >= 3,
  '破壊するユニットを選択'
);

// 効果実行
Effect.break(stack, stack.processing, target);
```

### カードの選択

フィールド以外のカードを選ぶ場合は `EffectHelper.selectCard()` を使用します。

```typescript
// 手札からカードを選ぶ
const [card] = await EffectHelper.selectCard(
  stack,
  owner,
  owner.hand,
  '捨てるカードを選択'
);
```

### エラーハンドリング

フレームワーク側でエラーハンドリングが行われるため、try-catch は必ずしも必要ありません。

## テキスト表示

`System.show()` の第3引数は、効果のテキストを簡潔にまとめます。

### ルール

1. **句読点は含めない**
2. **複数の効果は `\n` で連結**
3. **「このユニット」は「自身」に置き換える**
4. **選択情報は省略する**

### 例

カードテキスト：

```
このユニットがフィールドに出た時、あなたのフィールドにユニットが4体以下の場合、
あなたの捨札にある進化ユニット以外のコスト7以下の青属性のユニットを1体選ぶ。
それをあなたのフィールドに【特殊召喚】し、レベルを+2する。
```

`System.show()` の引数：

```typescript
await System.show(stack, 'カード名', '捨札から【特殊召喚】\nレベル+2');
```

## 選略・選告

プレイヤーに2つの選択肢を提示し、どちらか一方を発動する効果です。

### 選略と選告の違い

- **選略** - 効果の所有者が選択する
- **選告** - 対戦相手が選択する

### 実装方法

```typescript
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
    // 効果実装
  } else {
    await System.show(stack, 'カード名', '【沈黙】付与');
    // 効果実装
  }
}
```

### 重要な注意点

- 選択肢を提示した時点で、どちらかの効果が発動することが確定します
- **選択肢を提示した後に、if 文で効果を取り止めてはいけません**
- 選告の場合は `opponent.id` を指定します

```typescript
// 選告の場合
const [choice] = await System.prompt(stack, opponent.id, { /* ... */ });
```

## History の活用

ターン中の行動履歴を参照する効果（〈連撃〉など）では、`stack.core.histories` を使用します。

### History の構造

```typescript
interface History {
  card: Card;              // 使用されたカード
  action: 'drive' | 'boot'; // アクション種別
}
```

### 使用例

```typescript
onDriveSelf: async (stack: StackWithCard<Unit>) => {
  const self = stack.processing;
  const owner = self.owner;

  // このターンに自分がコスト2以上の緑属性のカードを使用しているか
  const hasUsedGreenCard = stack.core.histories.some(
    h => h.card.owner.id === owner.id &&
         h.card.catalog.color === Color.GREEN &&
         h.card.catalog.cost >= 2 &&
         h.card.id !== self.id  // 自分自身を除外
  );

  if (!hasUsedGreenCard) return;

  await System.show(stack, 'カード名', '効果発動');
  // 効果実装
}
```

## ベストプラクティス

### 1. 条件チェックは早期リターンを使う

```typescript
// 良い例
onDriveSelf: async (stack: StackWithCard<Unit>) => {
  if (条件を満たさない) return;

  await System.show(stack, 'カード名', 'テキスト');
  // 効果実装
}

// 悪い例
onDriveSelf: async (stack: StackWithCard<Unit>) => {
  if (条件を満たす) {
    await System.show(stack, 'カード名', 'テキスト');
    // 効果実装
  }
}
```

### 2. 変数名を明確にする

```typescript
const self = stack.processing;
const owner = self.owner;
const opponent = owner.opponent;
```

### 3. コメントを適切に書く

```typescript
// 相手のフィールドにLv3以上のユニットが存在するか確認
if (!EffectHelper.isUnitSelectable(
  stack.core,
  unit => unit.owner.id === opponent.id && unit.lv >= 3,
  owner
)) return;
```

## 次のステップ

- [API リファレンス](./api-reference.md) - 利用可能な関数とクラスの詳細
- [実装例](./examples.md) - 実際のカード効果の実装例

## 関連ドキュメント

- [アーキテクチャ](../architecture.md)
- [環境構築](../getting-started.md)
