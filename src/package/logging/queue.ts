import type { GameActionLog } from './types';
import { getSupabaseClient } from './supabase-client';

export class ActionQueue {
  private queue: GameActionLog[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private isFlushing: boolean = false;

  constructor(
    private batchSize: number,
    private flushInterval: number
  ) {
    this.startTimer();
  }

  enqueue(action: GameActionLog): void {
    this.queue.push(action);

    if (this.queue.length >= this.batchSize) {
      setImmediate(() => this.flush());
    }
  }

  async flush(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) return;

    this.isFlushing = true;
    try {
      const batch = this.queue.splice(0, this.batchSize);
      const client = getSupabaseClient();
      if (!client) return;

      const { error } = await client.from('game_actions').insert(batch);

      if (error) {
        console.error('[Logger] Failed to flush actions:', error);
        this.queue.unshift(...batch);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.flush().catch(console.error);
    }, this.flushInterval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
