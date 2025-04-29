import type { Stack } from './stack';

export type KeywordEffect = '秩序の盾' | '沈黙';

export type DeltaEffect =
  | {
      type: 'bp';
      diff: number;
    }
  | {
      type: 'keyword';
      name: KeywordEffect;
    };

export class Delta {
  count: number;
  event: string | undefined;
  effect: DeltaEffect;

  constructor(effect: DeltaEffect, event: string | undefined = undefined, count: number = 0) {
    this.effect = effect;
    this.event = event;
    this.count = count;
  }

  checkExpire(stack: Stack) {
    if (stack.type === this.event) this.count--;
    return this.event !== undefined && this.count <= 0;
  }
}
