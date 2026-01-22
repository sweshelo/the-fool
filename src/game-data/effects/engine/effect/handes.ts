import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card';
import { Joker } from '@/package/core/class/card/Joker';

export function effectHandes(stack: Stack, source: Card, target: Card): void {
  const owner = target.owner;
  const card = owner.find(target);

  if (card.place?.name === 'hand') {
    // inHand設定: 手札にあるJokerが他の領域に移動しようとした場合、消滅させる
    if (stack.core.room.rule.joker.inHand && target instanceof Joker) {
      // 手札から削除するだけ（どこにも追加しない）
      owner.hand = owner.hand.filter(c => c.id !== target.id);
    } else {
      target.lv = 1;
      owner.hand = owner.hand.filter(c => c.id !== target.id);
      owner.trash.push(target);
    }

    stack.core.room.sync();
    stack.core.room.soundEffect('destruction');

    stack.addChildStack('handes', source, target);
  }
}
