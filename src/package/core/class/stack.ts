import type { IAtom } from "@/submodule/suit/types"
import type { Player } from "./Player"

interface IStack {
  /**
   * @param type そのStackのタイプを示す
   */
  type: string
  /**
   * @param source そのStackを発生させたカードを示す。例えば召喚操作の場合、召喚されたUnitがここに指定される。
   */
  source: IAtom
  /**
   * @param target そのStackによって影響を受ける対象を示す。例えば破壊効果の場合、破壊されたUnitがここに指定される。
   */
  target?: IAtom | Player
  /**
   * @param parent そのStackが発生した契機の親にあたる。例えば召喚効果によって相手を破壊するStackが発生した場合、親が召喚スタック、子が破壊スタックとなる。
   */
  parent?: Stack
  /**
   * @param parent あるStackが発生した際、その解決途中に新規で発生したスタックに当たる。例えば召喚効果によって相手を破壊するStackが発生した場合、親が召喚スタック、子が破壊スタックとなる。
   * 子はいくつでも持つことが出来るが、同時に発生しない限り兄弟は持たない。
   * つまり「全体を破壊する」効果であれば、破壊スタックは兄弟になりえるが、破壊によって発生した新スタック(例: 《ミイラくん》によるハンデス)は兄弟ではなく子になる。
   */
  children: Stack[]
}

export class Stack implements IStack {
  type: string
  source: IAtom
  target?: IAtom | Player
  parent: undefined | Stack
  children: Stack[]

  constructor({ type, source, target, parent }: Omit<IStack, 'children'>) {
    this.type = type
    this.source = source
    this.target = target
    this.parent = parent
    this.children = []
  }

  async resolve(){
    
  }
}