import type { GameActionLog } from './types';
import { getSupabaseClient } from './supabase-client';

export class ActionQueue {
  private queue: GameActionLog[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

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
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client.from('game_actions').insert(batch);

    if (error) {
      console.error('[Logger] Failed to flush actions:', error);
      this.queue.unshift(...batch);
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
