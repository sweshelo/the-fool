import type { DeltaEffect, IDelta } from '@/submodule/suit/types';
import type { Stack } from './stack';

export class Delta implements IDelta {
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
