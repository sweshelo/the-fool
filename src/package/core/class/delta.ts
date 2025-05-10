import type { DeltaEffect, IDelta, IUnit } from '@/submodule/suit/types';
import type { StackWithCard } from '@/database/effects/classes/types';

export interface DeltaSource {
  unit: IUnit['id'];
  effectCode?: string; // 1つのユニットが異なる条件で複数のフィールド効果を持つ場合、それを識別するためのID
}
export class Delta implements IDelta {
  id: string;
  count: number;
  event: string | undefined;
  effect: DeltaEffect;
  source?: DeltaSource;
  onlyForOwnersTurn: boolean; // このパラメータが true のとき、eventに合致するイベントが発生しても自分のターン中でない場合はcountを減算しない
  permanent: boolean; // このパラメータが true のとき、unit.reset() しても残す (効果が永続するという意味ではない。その場合はeventにundefiendを設定する。)

  constructor(
    effect: DeltaEffect,
    event: string | undefined = undefined,
    count: number = 0,
    onlyForOwnersTurn = false,
    source: DeltaSource | undefined = undefined,
    permanent: boolean = false
  ) {
    this.id = crypto.randomUUID();
    this.effect = effect;
    this.event = event;
    this.count = count;
    this.onlyForOwnersTurn = onlyForOwnersTurn;
    this.source = source;
    this.permanent = permanent;
  }

  /**
   * イベントの発生をマークし、期限切れになったら true を返す
   * @returns 期限切れかどうか
   */
  checkExpire(stack: StackWithCard) {
    const isOwnersTurn = stack.core.getTurnPlayer().id === stack.processing.owner.id;
    if (stack.type === this.event && (this.onlyForOwnersTurn ? isOwnersTurn : true)) this.count--;
    return this.event !== undefined && this.count <= 0;
  }
}
