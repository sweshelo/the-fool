# Draft Summary

ターン制TCGを作る。ルールはMtGのような、標準的なものになる。

# ゲーム構成要素と用語

プレイヤーは2人
プレイヤーは以下のメンバを持つ

- 手札 Hand
- 山札 Deck
- 捨札 Trash
- フィールド Field
- トリガーゾーン Trigger-Zone
- CP (カードを使用する際に支払う manaに該当)
- Life (0になると敗北 初期値8)

## Drive

いわゆる「召喚」のこと。メソッドとしても drive onDrive などを用いる。

# 技術的な構成

- パッケージとして Core と Server と WebUI からなる。CoreとServerは同一ランタイム上で稼働し、ServerとWebUIがWebSocketで通信をする。
- WebSocketを通じてユーザはカードの操作を行い、Coreに通知する。Coreは効果の呼び出し、状態の変化、相手の行動などの様々な情報をユーザに通知する。
- WebUIはカードなどについてCoreのそれとは異なる独自のクラス定義を持つ。(カードの効果などはフロント側には持たせない。例えばカードを引く効果ならば「デッキからカードが減った、手札が1枚増えた」、という表面的な情報を伝達する。)

# Coreパッケージ クラス

原則、DeckやHandなどは基底クラスCardの配列として持ち、フィールドに召喚する操作を行った際などにinstance ofチェックを実施し召喚可否を確認する。

## Atom

- 構成

```
{
  id: string (uuid)
}
```

- 何故Atomが必要?
  対戦相手の手札の情報などは非公開だから、クライアントに送信する際にこの情報だけを送る。

## Events (Future Plan)

Eventsは、カード効果の具体的な実装である。keyのイベントが発行された際にCoreから呼び出され、そのイベントの詳細を指す stack を受け取り、効果を発動したのち、新たに発生したStackを返却する。**これは現段階では実装しない。**

- 構成計画

```
{
  [key: string]: (stack: Stack) => Promise<Stack[]>
}
```

## Catalog

カードの基本情報を持つデータベース。
{
id: string;
name: string;
text: string;
type: 'Unit' | 'Trigger'
cost: number;
events: Events;
}

## Card

Cardは、カードとして存在するクラスの基底クラスである。

- 構成

```
Card extend Atom {
  catalog: unknown // idだけを持たすか、Catalogインスタンスを持たすか、悩んでいる
}
```

## Unit

Unitは、カードのうち、いわゆるモンスターのようなフィールドに出すことが可能なカードである。

- 構成

```
Unit extend Card {
  bp: number // 0になると破壊される、Unitのライフのようなもの
}
```

## Trigger

Triggerは、カードのうち、いわゆる魔法カードのような効果のみを持つカードである。

- 構成

```
Trigger extend Card {
  remain: number // あと何回使える?
}
```

# 疑問点

- Cardの実装について、アドバイスが欲しい
  - catalogインスタンス、持たせるべき?
- coreとserverの関係について、考えて欲しい
  - serverは文字通りサーバーとしての役目だけを持ち、Roomクラスを定義して、roomがcoreを持つようにした方が良いかもしれない
  - そうするとroomはUserを2つ持ち、それぞれの通信をserver側でいい感じに分ける必要がある
- 普通(対戦前は)デッキの情報をカタログIDの集合で持つけど、ゲーム開始時に実体のカードインスタンスをどうやって初期化する？
  - string から どうやって適切な Card オブジェクトを生成するか、という話
- 現段階の草案を見て、甘いと感じる部分はある?
