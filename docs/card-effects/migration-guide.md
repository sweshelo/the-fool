# 永続効果の移行

これまで、フィールド効果を実装する枠組みとして `fieldEffect` のみが提供されていましたが、`1e4d7135604f52908847c386804f5aa39a7f275e` にて `PermanentEffect.mount` 関数が実装されました。  
過去には「効果の開始」「効果の終了」を自分で定義する必要がありましたが、このモジュールを利用することで、システムは「効果の対象になるか」「対象がその効果を受けたか」「対象から終了した効果を除去したか」を自動で適用するため、コードをとてもシンプルに保つことが出来ます。

なお、他にも直接 `Delta` を操作していた処理としては以下のようなものがありますが、それぞれ次の関数で代替でき、代替手段の方がシンプルに実装できます。

|効果|関数|
|--|--|
|コストの変動(固定値)| `Effect.modifyCost` |
|コストの変動(動的)| `Effect.dynamicCost` |
|BPの変動(動的)| `Effect.dynamicBp` |
|キーワードの除去| `Effect.removeKeyword` |

## 旧実装

動的に条件を満たしたり、満たさなかったりする効果では、その効果の対象になるかどうかを逐一検出して適用する必要がありました。

```ts
// ■森聖なる護封陣
// あなたのフィールドに【獣】ユニットが4体以上いる場合、あなたの【獣】ユニットに【秩序の盾】を与える。
fieldEffect: (stack: StackWithCard<Unit>): void => {
  const owner = stack.processing.owner;

  // 自分のフィールドの【獣】ユニットをフィルタリング
  const beastUnits = owner.field.filter(
    unit =>
      unit.catalog.species &&
      Array.isArray(unit.catalog.species) &&
      unit.catalog.species.includes('獣')
  );

  // フィールドに【獣】ユニットが4体以上いる場合の効果
  if (beastUnits.length >= 4) {
    beastUnits.forEach(unit => {
      // 既にこのユニットが発行したDeltaが存在するか確認
      const delta = unit.delta.find(
        delta =>
          delta.source?.unit === stack.processing.id &&
          delta.source.effectCode === '森聖なる護封陣'
      );

      if (!delta) {
        // 【秩序の盾】を付与
        Effect.keyword(stack, stack.processing, unit, '秩序の盾', {
          source: { unit: stack.processing.id, effectCode: '森聖なる護封陣' },
        });
      }
    });
  } else {
    // 条件を満たさなくなった場合、効果を解除
    owner.field.forEach(unit => {
      unit.delta = unit.delta.filter(
        delta =>
          !(
            delta.source?.unit === stack.processing.id &&
            delta.source.effectCode === '森聖なる護封陣'
          )
      );
    });
  }
}
```

## 新実装
`PermanentEffect.mount` を利用すると、その効果を発動する条件を指定すれば、システム側で自動的に効果解除が実行されるため、 `else` 節による効果解除はそもそも記述しなくて良くなります。

```ts
// ■森聖なる護封陣
// あなたのフィールドに【獣】ユニットが4体以上いる場合、あなたの【獣】ユニットに【秩序の盾】を与える。
fieldEffect: (stack: StackWithCard<Unit>): void => {
  // PermanentEffect.mount() を呼び出す
  PermanentEffect.mount(stack.processing, {
    // 効果を記述する
    // TIPS: 条件式は condition に全て記述します。型ガードとしての if文のみ記述します。
    // TIPS: PermanentEffect.mount() では、対象のユニットが発行した Delta が存在するかどうかを、生成された `source` によって判定するため、受け取った `source` は対象の効果関数に必ず渡します。
    effect: (card, source) => { if (card instanceof Unit) Effect.keyword(stack, stack.processing, card, '秩序の盾', { source }) },

    // targets で指定されたものに該当する Card 毎にこの condition が評価されます
    // フィールド効果全体の発動条件もここに記述します
    condition: (target) => target.catalog.species?.includes('獣') && stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('獣')).length >= 4,

    // condition の評価・effect の実行の対象となるカードをキーで指定します
    targets: ['owns']

    // 1つのユニットが複数のフィールド効果を持つ場合、システムが実施する Delta 存在チェックで効果を一意にするために用います
    // フィールド効果を1つしか持たない場合、この値は空文字列でも動作します
    effectCode: '森聖なる護封陣',
  })
}
```