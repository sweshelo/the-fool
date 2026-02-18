import type { Core } from '../index';
import { Parry } from '../class/parry';
import { System } from '@/game-data/effects';

/**
 * 現在のスタックを解決する
 * UnitDrive操作などでスタックが作成された後に呼び出される
 * @param core Coreインスタンス
 */
export async function resolveStack(core: Core): Promise<void> {
  if (core.stack !== undefined) {
    try {
      while (core.stack.length > 0) {
        const stackItem = core.stack.pop();
        await stackItem?.resolve(core);
        core.room.sync();

        // 後続のStackがある場合は待たせる
        if (core.stack.length > 0) {
          await System.sleep(750);
        }
      }

      // 処理完了後、スタックをクリア
      core.stack = [];
    } catch (error) {
      if (error instanceof Parry) throw error;
      console.error('Error resolving stack:', error);
      core.stack = [];
    }
  }
}
