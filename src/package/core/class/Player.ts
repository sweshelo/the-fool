import type { IAtom, IPlayer, PlayerEntryPayload } from '@/submodule/suit/types';
import { config } from '../../../config';
import type { Action } from './action';
import { Card } from './card/Card';
import { Unit, Evolve } from './card/Unit';
import master from '@/game-data/catalog';
import { Intercept } from './card/Intercept';
import { Trigger } from './card/Trigger';
import { Joker } from './card/Joker';
import type { Core } from '../index';

export interface PlayerAction {
  action: Action;
  stack?: unknown;
}

export interface FindResult {
  result: boolean;
  card?: Card;
  place?: {
    name: {
      [K in keyof Player]: Player[K] extends Card[] ? K : never;
    }[keyof Player];
    ref: Array<Card>;
  };
}

// PlayerのうちCard[]型であるプロパティ名から"called"を除外
export type CardArrayKeys = Exclude<
  {
    [K in keyof Player]: Player[K] extends Card[] ? K : never;
  }[keyof Player],
  'called'
>;

export class Player implements IPlayer {
  id: string;
  name: string;
  library: string[];
  deck: Card[];
  hand: Card[];
  trash: Card[];
  delete: Card[];
  field: Unit[];
  trigger: Card[];
  called: Card[]; // 呼び出し済みTrigger/Interceptを一時的に格納
  joker: {
    card: Joker[]; // 所有しているJokerアビリティ
    gauge: number; // ジョーカーゲージ
  };
  purple: number | undefined;

  #core: Core;

  cp: {
    current: number;
    max: number;
  } = {
    current: 0,
    max: 0,
  };
  life: { current: number; max: number } = {
    current: config.game.player.max.life,
    max: config.game.player.max.life,
  };

  constructor({ id, name, deck }: PlayerEntryPayload['player'], core: Core) {
    this.id = id;
    this.name = name;
    this.hand = [];
    this.field = [];
    this.trash = [];
    this.delete = [];
    this.trigger = [];
    this.called = [];
    this.joker = {
      card: [],
      gauge: core.room.rule.joker.gauge,
    };
    this.#core = core;

    // ライブラリからデッキを生成する
    this.library = [...deck];
    this.deck = this.initDeck();
  }

  initDeck() {
    return this.library
      .map(id => {
        const catalog = master.get(id);
        if (!catalog) throw new Error('不正なカードがデッキに含まれています');

        switch (catalog.type) {
          case 'unit':
            return new Unit(this, id);
          case 'advanced_unit':
            return new Evolve(this, id);
          case 'intercept':
            return new Intercept(this, id);
          case 'trigger':
            return new Trigger(this, id);
          default:
            throw new Error('未知のタイプが指定されました');
        }
      })
      .sort(() => Math.random() - 0.5);
  }

  // プレイヤー領域からカードを探す
  find(target: IAtom): FindResult {
    const onDeck = this.deck.find(({ id }) => id === target.id);
    if (onDeck)
      return {
        result: true,
        card: onDeck,
        place: {
          name: 'deck',
          ref: this.deck,
        },
      };

    const onTrash = this.trash.find(({ id }) => id === target.id);
    if (onTrash)
      return {
        result: true,
        card: onTrash,
        place: {
          name: 'trash',
          ref: this.trash,
        },
      };

    const onHand = this.hand.find(({ id }) => id === target.id);
    if (onHand)
      return {
        result: true,
        card: onHand,
        place: {
          name: 'hand',
          ref: this.hand,
        },
      };

    const onTrigger = this.trigger.find(({ id }) => id === target.id);
    if (onTrigger)
      return {
        result: true,
        card: onTrigger,
        place: {
          name: 'trigger',
          ref: this.trigger,
        },
      };

    const onCalled = this.called.find(({ id }) => id === target.id);
    if (onCalled)
      return {
        result: true,
        card: onCalled,
        place: {
          name: 'called',
          ref: this.called,
        },
      };

    const onDelete = this.delete.find(({ id }) => id === target.id);
    if (onDelete)
      return {
        result: true,
        card: onDelete,
        place: {
          name: 'delete',
          ref: this.delete,
        },
      };

    // 本当に必要?
    const onField = this.field.find(({ id }) => id === target.id);
    if (onField)
      return {
        result: true,
        card: onField,
        place: {
          name: 'field',
          ref: this.field,
        },
      };

    return { result: false };
  }

  // カードを引く
  draw(allowOverflow: boolean = false): PlayerAction | void {
    if (this.deck.length === 0) {
      this.trash = [];
      this.delete = [];
      this.deck = this.initDeck();
    }

    if (this.#core.room.rule.player.max.hand > this.hand.length || allowOverflow) {
      const source = this.deck.shift();
      if (source instanceof Card) {
        this.hand.push(source);
        return {
          action: {
            role: 'system',
            type: 'draw',
            source: source,
          },
        };
      }
    }
  }

  // ドライブ
  drive(target: Unit) {
    if (this.field.length < config.game.player.max.field) {
      this.field.push(target);
      return {
        action: {
          role: 'user',
          type: 'drive',
          source: target,
        },
      };
    } else {
      return null;
    }
  }

  // 対戦相手特定
  get opponent() {
    const result = this.#core.players.find(player => player.id !== this.id);
    if (!result) {
      throw new Error('プレイヤーが見つかりませんでした');
    } else {
      return result;
    }
  }

  // Core アクセス（Joker.isAvailable getter で使用）
  get core() {
    return this.#core;
  }

  damage(self: boolean = false) {
    this.life.current--;
    const rule = this.#core.room.rule.joker;
    if (!self || rule.suicide) {
      this.joker.gauge = Math.min(this.joker.gauge + rule.lifeDamage, 100);
    }
    if (this.life.current <= 0) return true;
  }
}
