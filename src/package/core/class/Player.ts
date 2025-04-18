import type { IAtom, IPlayer, PlayerEntryPayload } from '@/submodule/suit/types';
import { config } from '../../../config';
import type { Action } from './action';
import { Card } from './card/Card';
import { Unit } from './card/Unit';
import master from '@/database/catalog';
import { Intercept } from './card/Intercept';
import { Trigger } from './card/Trigger';
import { Evolve } from './card/Evolve';

export interface PlayerAction {
  action: Action;
  stack?: unknown;
}

export interface FindResult {
  result: boolean;
  card?: Card;
  place?: {
    name: string;
    ref: Array<Card>;
  };
}

export class Player implements IPlayer {
  id: string;
  name: string;
  library: string[];
  deck: Card[];
  hand: Card[];
  trash: Card[];
  field: Unit[];
  trigger: Card[];
  called: Card[]; // 呼び出し済みTrigger/Interceptを一時的に格納

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

  constructor({ id, name, deck }: PlayerEntryPayload['player']) {
    this.id = id;
    this.name = name;
    this.hand = [];
    this.field = [];
    this.trash = [];
    this.trigger = [];
    this.called = [];

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
            return new Unit(id);
          case 'advanced_unit':
            return new Evolve(id);
          case 'intercept':
            return new Intercept(id);
          case 'trigger':
            return new Trigger(id);
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
  draw(): PlayerAction | null {
    if (this.deck.length > 0) {
      const source = this.deck.shift() as Card;
      this.hand.push(source!);
      return {
        action: {
          role: 'system',
          type: 'draw',
          source: source,
        },
      };
    } else {
      this.trash = [];
      this.deck = this.initDeck();
      const source = this.deck.shift() as Card;
      this.hand.push(source!);
      return {
        action: {
          role: 'system',
          type: 'draw',
          source: source,
        },
      };
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
}
