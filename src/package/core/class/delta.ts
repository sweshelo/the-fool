import type { DeltaEffect, IDelta, IUnit } from '@/submodule/suit/types';
import type { StackWithCard } from '@/game-data/effects/schema/types';

export interface DeltaSource {
  unit: IUnit['id'];
  effectCode?: string; // 1つのユニットが異なる条件で複数のフィールド効果を持つ場合、それを識別するためのID
}

interface DeltaConstructorOptionParams {
  event?: string;
  count?: number;
  onlyForOwnersTurn?: boolean;
  source?: DeltaSource;
  permanent?: boolean;
}

export class Delta implements IDelta {
  id: string;
  count: number;
  event: string | undefined;
  effect: DeltaEffect;
  source?: DeltaSource;
  onlyForOwnersTurn: boolean; // このパラメータが true のとき、eventに合致するイベントが発生しても自分のターン中でない場合はcountを減算しない
  permanent: boolean; // このパラメータが true のとき、unit.reset() しても残す (効果が永続するという意味ではない。その場合はeventにundefiendを設定する。)

  constructor(effect: DeltaEffect, options: DeltaConstructorOptionParams | undefined = {}) {
    this.id = crypto.randomUUID();
    this.effect = effect;
    this.event = options.event;
    this.count = options.count ?? 0;
    this.onlyForOwnersTurn = options.onlyForOwnersTurn ?? false;
    this.source = options.source;
    this.permanent = options.permanent ?? false;
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
