# API リファレンス

カード効果を実装する際に使用する主要なクラスとメソッドのリファレンスです。

## 目次

1. [Effect クラス](#effect-クラス)
2. [EffectHelper クラス](#effecthelper-クラス)
3. [System クラス](#system-クラス)
4. [EffectTemplate クラス](#effecttemplate-クラス)
5. [PermanentEffect クラス](#permanenteffect-クラス) 🆕

---

## Effect クラス

`Effect` クラスは、ゲームの基本的な操作（破壊、移動、ダメージなど）を提供します。

### 基本原則

- ゲームオブジェクトを**直接操作してはいけません**
- 必ず `Effect` クラスのメソッドを使用してください

### メソッド一覧

#### `Effect.damage()`

対象にダメージを与えます。

```typescript
static damage(
  stack: Stack,
  source: Card,
  target: Unit,
  value: number,
  type: 'effect' | 'battle' = 'effect'
): boolean | undefined
```

**パラメータ:**

- `stack` - 親スタック
- `source` - ダメージを与える効果を発動したカード
- `target` - ダメージを受けるユニット
- `value` - ダメージ量
- `type` - ダメージのタイプ（`'effect'` または `'battle'`、デフォルトは `'effect'`）

**返り値:**

- `true` - 対象が破壊された場合
- `false` - 対象が破壊されなかった場合

**使用例:**

```typescript
// 対戦相手のユニットに3000ダメージ
Effect.damage(stack, stack.processing, target, 3000);
```

**自動処理:**

- 【不滅】【秩序の盾】【王の治癒力】などの耐性チェック
- 【オーバーヒート】によるダメージ2倍処理
- BP が 0 以下になった場合の自動破壊

---

#### `Effect.modifyBP()`

対象の BP を操作します。

```typescript
static modifyBP(
  stack: Stack,
  source: Card,
  target: Unit,
  value: number,
  option: ModifyBPOption
)
```

**パラメータ:**

- `stack` - 親スタック
- `source` - BP を変動させる効果を発動したカード
- `target` - BP が変動するユニット
- `value` - 操作量（正の値で増加、負の値で減少）
- `option` - オプション（後述）

**option の種類:**

```typescript
// 基本BPを変更（永続的な変更）
{ isBaseBP: true }

// イベントベースの変更（ターン終了時まで、など）
{ event: 'turnEnd', count: 1 }

// sourceベースの変更（永続効果用）
{ source: { unit: self.id } }
```

**使用例:**

```typescript
// ターン終了時までBP+2000
Effect.modifyBP(stack, self, target, 2000, {
  event: 'turnEnd',
  count: 1
});

// 永続効果でBP+1000（フィールドにいる間）
Effect.modifyBP(stack, self, self, 1000, {
  source: { unit: self.id }
});

// 基本BPを+500（永続的）
Effect.modifyBP(stack, self, target, 500, {
  isBaseBP: true
});
```

---

#### `Effect.break()`

ユニットを破壊します。

```typescript
static break(
  stack: Stack,
  source: Card,
  target: Unit,
  cause: 'effect' | 'damage' | 'modifyBp' | 'battle' | 'death' | 'system' = 'effect'
): void
```

**パラメータ:**

- `stack` - 親スタック
- `source` - 効果の発動元
- `target` - 破壊の対象
- `cause` - 破壊の原因（通常は `'effect'` を使用）

**使用例:**

```typescript
// 対戦相手のユニットを破壊
Effect.break(stack, stack.processing, target);
```

**自動処理:**

- 【破壊効果耐性】のチェック
- `onBreak` イベントの発火

---

#### `Effect.delete()`

ユニットを消滅させます。

```typescript
static delete(stack: Stack, source: Card, target: Unit): void
```

**パラメータ:**

- `stack` - 親スタック
- `source` - 効果の発動元
- `target` - 消滅の対象

**使用例:**

```typescript
// 対戦相手のユニットを消滅
Effect.delete(stack, stack.processing, target);
```

---

#### `Effect.bounce()`

ユニットを手札やデッキに戻します。

```typescript
static bounce(
  stack: Stack,
  source: Card,
  target: Unit,
  location: 'hand' | 'deck' | 'trigger' = 'hand'
): void
```

**パラメータ:**

- `stack` - 親スタック
- `source` - 効果の発動元
- `target` - 移動の対象
- `location` - 移動先（`'hand'`、`'deck'`、`'trigger'`）

**使用例:**

```typescript
// 対戦相手のユニットを手札に戻す
Effect.bounce(stack, stack.processing, target, 'hand');

// 自分のユニットをデッキに戻す
Effect.bounce(stack, stack.processing, self, 'deck');
```

---

#### `Effect.move()`

カードを任意の場所に移動させます。

```typescript
static move(
  stack: Stack,
  source: Card,
  target: Card,
  location: 'hand' | 'trash' | 'deck' | 'delete' | 'trigger'
): void
```

**使用例:**

```typescript
// 手札のカードを捨札に移動
Effect.move(stack, stack.processing, card, 'trash');
```

---

#### `Effect.keyword()`

キーワード能力を付与します。

```typescript
static keyword(
  stack: Stack,
  source: Card,
  target: Unit,
  keyword: KeywordEffect,
  params?: KeywordOptionParams
): void
```

**パラメータ:**

- `keyword` - キーワード名（例: `'迅速'`、`'沈黙'`、`'不滅'`）
- `params` - オプションパラメータ

**使用例:**

```typescript
// 【迅速】を付与
Effect.keyword(stack, self, self, '迅速');

// ターン終了時まで【次元干渉】を付与
Effect.keyword(stack, self, target, '次元干渉', {
  event: 'turnEnd',
  count: 1
});
```

---

#### `Effect.summon()`

ユニットを特殊召喚します。

```typescript
static async summon(
  stack: Stack,
  source: Card,
  target: Unit
): Promise<void>
```

**使用例:**

```typescript
// 捨札からユニットを特殊召喚
await Effect.summon(stack, stack.processing, unit);
```

---

#### `Effect.activate()`

ユニットの行動権を操作します。

```typescript
static activate(
  stack: Stack,
  source: Card,
  target: Unit,
  active: boolean
): void
```

**パラメータ:**

- `active` - `true` で行動権付与、`false` で行動権消費

**使用例:**

```typescript
// 行動権を付与
Effect.activate(stack, self, target, true);

// 行動権を消費
Effect.activate(stack, self, target, false);
```

---

## EffectHelper クラス

`EffectHelper` クラスは、ユニットの選択、ランダム処理などのユーティリティを提供します。

### メソッド一覧

#### `EffectHelper.isUnitSelectable()`

ユニットを選択する効果を発動可能かチェックします。

```typescript
static isUnitSelectable(
  core: Core,
  filter: ((unit: Unit) => boolean) | 'owns' | 'opponents' | 'all',
  selector: Player
): boolean
```

**パラメータ:**

- `core` - コアオブジェクト
- `filter` - 独自のフィルタ関数 または フィルタキーワード
- `selector` - 選択を行うプレイヤー

**使用例:**

```typescript
// 対戦相手のLv3以上のユニットを選択可能か調べる
if(EffectHelper.isUnitSelectable(
  stack.core,
  unit => unit.owner.id === opponent.id && unit.lv >= 3,
  owner
)) {
  // ...
};
```

**自動処理:**

- 【加護】を持つユニットを除外

---

#### `EffectHelper.pickUnit()`

フィールド上のユニットから1体以上を選択します。

> [!Important]
> 以前存在した `EffectHelper.selectUnit()` は現在非推奨です。これは、`candidate()` + `selectUnit()` では、複数のユニットを選択する際に【セレクトハック】を十分に考慮できていないためです。
> `isUnitSelectable()` + `pickUnit()` を使用して下さい。

```typescript
static async pickUnit(
  stack: Stack,
  player: Player,
  filter: UnitPickFilter,
  title: string,
  count: number = 1
): Promise<[Unit, ...Unit[]]>
```

**パラメータ:**

- `stack` - スタック
- `player` - 選択を行うプレイヤー
- `filter` - 選択を絞り込むフィルター または フィルタキーワード
- `title` - UI に表示するメッセージ
- `count` - 選択するユニット数（デフォルト: 1）

**使用例:**

```typescript
// 選択可能なユニットが存在するかチェック
// 選択可能なユニットが存在しない場合は発動しない
if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) return;

await System.show(stack, 'カード名', '破壊');

// ユニットを選択
const [target] = await EffectHelper.pickUnit(
  stack,
  owner,
  'opponents',
  '破壊するユニットを選択'
);

// 効果実行
Effect.break(stack, stack.processing, target);
```

---

#### `EffectHelper.selectCard()`

フィールド以外のカード（手札、捨札など）から選択します。

```typescript
static async selectCard(
  stack: Stack,
  player: Player,
  targets: Card[],
  title: string,
  count: number = 1
): Promise<[Card, ...Card[]]>
```

**使用例:**

```typescript
// 手札からカードを選択
const [card] = await EffectHelper.selectCard(
  stack,
  owner,
  owner.hand,
  '捨てるカードを選択'
);

// 捨札に移動
Effect.move(stack, stack.processing, card, 'trash');
```

---

#### `EffectHelper.random()`

配列からランダムに要素を選択します。

```typescript
static random<T>(targets: T[], number = 1): T[]
```

**パラメータ:**

- `targets` - 選択元の配列
- `number` - 選択する要素数（デフォルト: 1）

**使用例:**

```typescript
// 対戦相手のユニットからランダムに1体選択
const [target] = EffectHelper.random(opponent.field);

// 対戦相手のユニットからランダムに2体選択
const targets = EffectHelper.random(opponent.field, 2);
```

---

#### `EffectHelper.shuffle()`

配列をシャッフルします。

```typescript
static shuffle<T>(targets: T[]): T[]
```

**使用例:**

```typescript
const shuffled = EffectHelper.shuffle(player.deck);
```

---

#### `EffectHelper.exceptSelf()`

自身以外のすべてのユニットに効果を適用します。

```typescript
static exceptSelf(
  core: Core,
  card: Unit,
  effect: (unit: Unit) => void
): void
```

**使用例:**

```typescript
// 自身以外の全てのユニットのBPを-1000
EffectHelper.exceptSelf(stack.core, self, (unit) => {
  Effect.modifyBP(stack, self, unit, -1000, {
    event: 'turnEnd',
    count: 1
  });
});
```

---

#### `EffectHelper.isBreakByEffect()`

破壊が効果によるものかを判定します。

```typescript
static isBreakByEffect(stack: Stack): boolean
```

**使用例:**

```typescript
onBreak: async (stack: StackWithCard<Unit>) => {
  // 効果による破壊でない場合は発動しない
  if (!EffectHelper.isBreakByEffect(stack)) return;

  await System.show(stack, 'カード名', '効果発動');
  // 実装
}
```

---

## System クラス

`System` クラスは、UI 表示や選択プロンプトを提供します。

### メソッド一覧

#### `System.show()`

効果内容をクライアントに表示します。

```typescript
static async show(
  stack: Stack,
  title: string,
  message: string
): Promise<void>
```

**パラメータ:**

- `stack` - スタック
- `title` - 効果名（通常はカード名）
- `message` - 効果内容の簡潔な説明

**使用例:**

```typescript
await System.show(stack, 'ジャンプーダンス', '手札に戻す');
```

**重要:**

- 通常効果では必ず `System.show()` を呼び出す必要があります
- 効果を最後まで発動できることが確定してから呼び出します
- 1つの効果中に1度だけ呼び出します

---

#### `System.prompt()`

プレイヤーに選択肢を提示します。

```typescript
static async prompt(
  stack: Stack,
  playerId: string,
  choices: Choices
): Promise<string[]>
```

**パラメータ:**

- `stack` - スタック
- `playerId` - 選択を行うプレイヤーの ID
- `choices` - 選択肢オブジェクト

**Choices の種類:**

```typescript
// ユニット選択
{
  title: string,
  type: 'unit',
  items: Unit[]
}

// カード選択
{
  title: string,
  type: 'card',
  items: Card[],
  count: number  // 選択する枚数
}

// オプション選択（選略・選告）
{
  title: string,
  type: 'option',
  items: Array<{
    id: string,
    description: string
  }>
}
```

**使用例:**

```typescript
// ユニット選択（EffectHelper.pickUnit を推奨）
const [unitId] = await System.prompt(stack, owner.id, {
  title: '対象を選択',
  type: 'unit',
  items: opponent.field
});

// オプション選択（選略）
const [choice] = await System.prompt(stack, owner.id, {
  title: '選略',
  type: 'option',
  items: [
    { id: '1', description: '効果1の説明' },
    { id: '2', description: '効果2の説明' }
  ]
});
```

---

## EffectTemplate クラス

`EffectTemplate` クラスは、頻出する効果のテンプレートを提供します。

### メソッド一覧

#### `EffectTemplate.draw()`

プレイヤーにカードを1枚ドローさせます。

```typescript
static draw(player: Player, core: Core): Card | void
```

**使用例:**

```typescript
// 1枚ドロー
EffectTemplate.draw(owner, stack.core);

// 2枚ドロー
EffectTemplate.draw(owner, stack.core);
EffectTemplate.draw(owner, stack.core);
```

---

#### `EffectTemplate.revive()`

捨札からカードを手札に加えます（リバイブ効果）。

```typescript
static async revive(stack: StackWithCard, count: number = 1): Promise<void>
```

**パラメータ:**

- `count` - 回収する枚数（デフォルト: 1）

**使用例:**

```typescript
// 捨札から1枚手札に加える
await EffectTemplate.revive(stack);

// 捨札から2枚手札に加える
await EffectTemplate.revive(stack, 2);
```

---

#### `EffectTemplate.reinforcements()`

デッキから条件に合うカードをサーチします（援軍効果）。

```typescript
static reinforcements(
  stack: Stack,
  player: Player,
  match: ReinforcementMatcher
): Card | undefined
```

**ReinforcementMatcher:**

```typescript
interface ReinforcementMatcher {
  color?: number;      // 色
  species?: Species;   // 種族
  type?: Omit<Catalog['type'], 'joker'>[];  // タイプ
}
```

**使用例:**

```typescript
// デッキから青属性のカードをサーチ
const card = EffectTemplate.reinforcements(stack, owner, {
  color: Color.BLUE
});

// デッキから【武身】をサーチ
const card = EffectTemplate.reinforcements(stack, owner, {
  species: '武身'
});
```

---

## 共通パターン

### ユニット選択と効果実行の基本パターン

```typescript
onDriveSelf: async (stack: StackWithCard<Unit>) => {
  const self = stack.processing;
  const owner = self.owner;
  const opponent = owner.opponent;

  // 1. 選択可能なユニットをフィルタリング
  // 2. 選択可能なユニットが存在しない場合は発動しない
  if (EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) return;

  // 3. 効果表示
  await System.show(stack, 'カード名', '破壊');

  // 4. ユニット選択
  const [target] = await EffectHelper.pickUnit(
    stack,
    owner,
    'opponents',
    '破壊するユニットを選択'
  );

  // 5. 効果実行
  Effect.break(stack, self, target);
}
```

### 永続効果の基本パターン

```typescript
fieldEffect: (stack: StackWithCard<Unit>) => {
  const self = stack.processing;

  // 既存のDeltaを確認
  const delta = self.delta.find(
    d => d.source.unit === self.id && d.effect.type === 'bp'
  );

  if (delta) {
    // Deltaを更新
    delta.effect.diff = 1000;
  } else {
    // Deltaを新規作成
    Effect.modifyBP(stack, self, self, 1000, {
      source: { unit: self.id }
    });
  }
}
```

### 選略・選告の基本パターン

```typescript
onDriveSelf: async (stack: StackWithCard<Unit>) => {
  const owner = stack.processing.owner;

  // 選択肢1が選べるか確認
  const canOption1 = /* 条件 */;

  // プロンプト表示（選べない選択肢がある場合は自動選択）
  const [choice] = canOption1
    ? await System.prompt(stack, owner.id, {
        title: '選略',
        type: 'option',
        items: [
          { id: '1', description: '効果1' },
          { id: '2', description: '効果2' }
        ]
      })
    : ['2'];  // 選択肢1が選べない場合は2を自動選択

  // 選択に応じた効果を実行
  if (choice === '1') {
    await System.show(stack, 'カード名', '効果1');
    // 実装
  } else {
    await System.show(stack, 'カード名', '効果2');
    // 実装
  }
}
```

---

## PermanentEffect クラス

`PermanentEffect` クラスは、フィールド効果や手札効果などの**永続的な効果**を簡潔に記述するためのヘルパークラスです。

### 概要

従来のフィールド効果の実装では、以下のような煩雑なコードが必要でした:

```typescript
// 従来の実装（煩雑）
fieldEffect: (stack: StackWithCard<Unit>) => {
  stack.processing.owner.field.forEach(unit => {
    // 既存Deltaの存在チェック
    const existingDelta = unit.delta.find(d =>
      d.source?.unit === stack.processing.id &&
      d.source?.effectCode === '効果コード'
    );

    // 条件評価
    const conditionMet = unit.lv >= 2;

    if (existingDelta) {
      if (!conditionMet) {
        // 条件が外れた → 削除
        unit.delta = unit.delta.filter(d =>
          !(d.source?.unit === stack.processing.id &&
            d.source?.effectCode === '効果コード')
        );
      }
    } else {
      if (conditionMet) {
        // 条件が満たされた → 追加
        Effect.keyword(stack, stack.processing, unit, '不屈', {
          source: { unit: stack.processing.id, effectCode: '効果コード' }
        });
      }
    }
  });
}
```

`PermanentEffect.mount()` を使うと、これを以下のように簡潔に記述できます:

```typescript
// PermanentEffect使用（簡潔）
fieldEffect: (stack: StackWithCard<Unit>) => {
  PermanentEffect.mount(stack, stack.processing, {
    targets: ['owns'],
    effect: (unit, option) => Effect.keyword(stack, stack.processing, unit, '不屈', option),
    condition: unit => unit.lv >= 2,
    effectCode: '不屈付与',
  });
}
```

### 自動処理される内容

`PermanentEffect.mount()` は以下の処理を自動的に行います:

1. **冪等性の保証**: 同じ `effectCode` の Delta が既に存在する場合は追加しない
2. **条件評価**: `condition` 関数で条件を評価し、満たされた場合のみ効果を適用
3. **自動削除**: 条件が満たされなくなった場合、自動的に Delta を除去
4. **source 情報の管理**: `unit.id` と `effectCode` から一意な source 情報を自動生成

### メソッド

#### `PermanentEffect.mount()`

永続効果をマウント（適用）します。

```typescript
static mount(
  stack: Stack,
  source: Unit,
  details: EffectDetails
): void
```

**パラメータ:**

- `stack` - 現在のスタック
- `source` - 効果の発動元ユニット（通常は `stack.processing`）
- `details` - 効果の詳細設定（後述）

### EffectDetails 型

`details` パラメータは以下の型を持ちます:

```typescript
type EffectDetails =
  | {
      targets: ['self']
      effect: (unit: Unit, option: DeltaSourceOption) => void
      condition?: (unit: Unit) => boolean
      effectCode: string
    }
  | {
      targets: ['owns'] | ['opponents'] | ['both'] | ['owns', 'field'] | ['opponents', 'field'] | ['both', 'field']
      effect: (unit: Unit, option: DeltaSourceOption) => void
      condition?: (unit: Unit) => boolean
      effectCode: string
    }
  | {
      targets: ['owns', 'hand'] | ['opponents', 'hand'] | ['both', 'hand'] | ['owns', 'trigger'] | ['opponents', 'trigger'] | ['both', 'trigger']
      effect: (card: Card, option: DeltaSourceOption) => void
      condition?: (card: Card) => boolean
      effectCode: string
    }
```

**フィールド:**

- `targets` - 効果の対象を指定する配列（必須）
  - **第1要素**: 所有者を指定
    - `'self'` - 自分自身のみ（特殊ケース）
    - `'owns'` - 自分
    - `'opponents'` - 対戦相手
    - `'both'` - 両方のプレイヤー
  - **第2要素**: 領域を指定（省略時は `'field'` がデフォルト）
    - `'field'` - フィールド上のユニット
    - `'hand'` - 手札
    - `'trigger'` - トリガーゾーン
  - **例**:
    - `['owns']` → 自分のフィールド（デフォルト）
    - `['owns', 'hand']` → 自分の手札
    - `['opponents', 'trigger']` → 対戦相手のトリガーゾーン
    - `['both']` → 両方のプレイヤーのフィールド
    - `['both', 'hand']` → 両方のプレイヤーの手札

- `effect` - 効果を適用する関数（必須）
  - 第1引数: 対象のカード（`targets` に応じて `Unit` または `Card` 型）
  - 第2引数: `DeltaSourceOption` オブジェクト（`Effect.keyword()` 等に渡す）

- `condition` - 効果を適用する条件（省略時は常に適用）
  - 引数: 対象のカード
  - 戻り値: `boolean`（`true` の場合のみ効果を適用）

- `effectCode` - 効果を識別するためのコード（必須）
  - 同じユニットが複数の異なる効果を持つ場合、それぞれ異なる `effectCode` を指定

### 使用例

#### 基本的な使用例

```typescript
// Lv2以上の味方ユニットにBP+2000
fieldEffect: (stack: StackWithCard<Unit>) => {
  PermanentEffect.mount(stack, stack.processing, {
    targets: ['owns'],
    effect: (unit, option) =>
      Effect.modifyBP(stack, stack.processing, unit, 2000, option),
    condition: unit => unit.lv >= 2,
    effectCode: 'BP強化',
  });
}
```

#### 複数の効果を持つカード（Demeter の例）

```typescript
fieldEffect: (stack: StackWithCard<Unit>) => {
  // 効果1: Lv3以上の味方に【不屈】
  PermanentEffect.mount(stack, stack.processing, {
    targets: ['owns'],
    effect: (unit, option) =>
      Effect.keyword(stack, stack.processing, unit, '不屈', option),
    condition: unit => unit.lv >= 3,
    effectCode: '豊穣の女神_Lv3',
  });

  // 効果2: Lv2以上の味方にBP+2000
  PermanentEffect.mount(stack, stack.processing, {
    targets: ['owns'],
    effect: (unit, option) =>
      Effect.modifyBP(stack, stack.processing, unit, 2000, option),
    condition: unit => unit.lv >= 2,
    effectCode: '豊穣の女神_Lv2',
  });

  // 効果3: Lv1の自分自身に【秩序の盾】
  PermanentEffect.mount(stack, stack.processing, {
    targets: ['self'],
    effect: (unit, option) =>
      Effect.keyword(stack, stack.processing, unit, '秩序の盾', option),
    condition: unit => unit.lv === 1,
    effectCode: '大地の掟',
  });
}
```

#### 種族条件の例

```typescript
// 【侍】ユニットに【不屈】を付与
fieldEffect: (stack: StackWithCard<Unit>) => {
  PermanentEffect.mount(stack, stack.processing, {
    targets: ['owns'],
    effect: (unit, option) =>
      Effect.keyword(stack, stack.processing, unit, '不屈', option),
    condition: unit => unit.catalog.species?.includes('侍') ?? false,
    effectCode: '心眼の撫子',
  });
}
```

#### 手札への効果の例

```typescript
// 手札の赤属性ユニットのコストを-1
fieldEffect: (stack: StackWithCard<Unit>) => {
  const owner = stack.processing.owner;
  const hasNotSummonedUnits = !stack.core.histories.some(
    h => h.action === 'drive' && h.card.owner.id === owner.id
  );

  PermanentEffect.mount(stack, stack.processing, {
    targets: ['owns', 'hand'],  // 自分の手札
    effect: (card, option) => {
      if (card instanceof Unit) {
        card.delta.push(new Delta({ type: 'cost', value: -1 }, option));
      }
    },
    condition: card =>
      card.catalog.color === Color.RED &&
      card instanceof Unit &&
      hasNotSummonedUnits,
    effectCode: '甘い誘い',
  });
}
```

#### 効果源に依存する条件の例

```typescript
// 自分がLv3の時のみ、味方ユニットに効果を付与
fieldEffect: (stack: StackWithCard<Unit>) => {
  PermanentEffect.mount(stack, stack.processing, {
    targets: ['owns'],
    effect: (unit, option) =>
      Effect.keyword(stack, stack.processing, unit, '加護', option),
    condition: (_unit) => stack.processing.lv === 3,  // 効果源のレベルを参照
    effectCode: '火遠理の加護',
  });
}
```

#### 両方のプレイヤーへの効果の例

```typescript
// 全てのユニットのBPを-1000（両方のプレイヤー）
fieldEffect: (stack: StackWithCard<Unit>) => {
  PermanentEffect.mount(stack, stack.processing, {
    targets: ['both'],  // 両方のプレイヤーのフィールド
    effect: (unit, option) =>
      Effect.modifyBP(stack, stack.processing, unit, -1000, option),
    effectCode: '全体弱体',
  });
}
```

```typescript
// 全てのプレイヤーの手札のコストを+1
fieldEffect: (stack: StackWithCard<Unit>) => {
  PermanentEffect.mount(stack, stack.processing, {
    targets: ['both', 'hand'],  // 両方のプレイヤーの手札
    effect: (card, option) => {
      if (card instanceof Unit) {
        card.delta.push(new Delta({ type: 'cost', value: 1 }, option));
      }
    },
    effectCode: '全体コスト増加',
  });
}
```

### 注意事項

1. **effectCode は必須**: 同じユニットが複数の効果を持つ場合、それぞれに異なる `effectCode` を指定してください

2. **effect 関数内での Delta 追加**: `Effect.keyword()` や `Effect.modifyBP()` は内部で Delta を追加します。手動で Delta を追加する場合は、`option` を渡してください

3. **condition の評価タイミング**: `processFieldEffect()` が呼ばれるたびに評価されます

4. **自動アンマウント**: ユニットがフィールドを離れた場合、そのユニットの `source` を持つ Delta は自動的に除去されます（Core 層で処理）

### DeltaSourceOption 型

`effect` 関数の第2引数として渡される型です:

```typescript
type DeltaSourceOption = {
  source: {
    unit: string;      // 効果の発動元ユニットのID
    effectCode: string; // 効果を識別するコード
  }
}
```

この `option` を `Effect.keyword()` や `Effect.modifyBP()` に渡すことで、Delta に正しい source 情報が付与されます。

---

## 次のステップ

- [カード効果実装ガイド](./implementation-guide.md) - 実装の詳細ルール
- [実装例](./examples.md) - 実際のカード効果の実装例

## 関連ドキュメント

- [アーキテクチャ](../architecture.md)
- [環境構築](../getting-started.md)
