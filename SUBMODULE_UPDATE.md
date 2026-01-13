# サブモジュール更新概要

## 概要

サンドボックス環境の実装にあたり、`suit` サブモジュールを初期化する必要があります。

## サブモジュールの初期化

新しいクローン後、または初回セットアップ時に以下のコマンドを実行してください:

```bash
git submodule update --init --recursive
```

## サブモジュールの内容

### src/submodule/suit

このサブモジュールは、サーバー（the-fool）とクライアント（the-magician）間で共有される型定義を提供します。

**主要な型定義:**

- `IAtom`: カードの基本識別子（id のみ）
- `ICard`: カードの詳細情報（catalogId, lv, delta を含む）
- `IUnit`: ユニットの詳細情報（bp, currentBP, active などを含む）
- `IPlayer`: プレイヤーの状態
- `SyncPayload`: sync() で送信されるゲーム状態
- `Rule`: ゲームルール設定

**サンドボックス機能で使用する型:**

```typescript
// sync() で送信される内容
interface SyncPayload {
  type: 'Sync';
  body: {
    rule: Rule;
    game: {
      round: number;
      turn: number;
    };
    players: { [key: string]: IPlayer };
  };
}

// プレイヤー情報（非公開情報は IAtom 型で送信される）
interface IPlayer {
  id: string;
  name: string;
  deck: IAtom[];      // 相手には id のみ
  hand: IAtom[];      // 相手には id のみ
  field: IUnit[];     // 完全な情報
  trash: ICard[];     // 完全な情報
  delete: ICard[];    // 完全な情報
  trigger: IAtom[];   // 相手には id + color
  cp: { current: number; max: number };
  life: { current: number; max: number };
  joker: { card: IJoker[]; gauge: number };
  purple: number | undefined;
}
```

## 注意点

- サブモジュールの更新がある場合は `git submodule update --remote` を実行
- 型定義の変更がある場合は、サーバーとクライアント両方で同じバージョンのサブモジュールを使用すること
