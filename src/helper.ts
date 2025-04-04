import type { Unit } from './package/core/class/card'
import type { IAtom } from './submodule/suit/types'

const isUnit = (card: IAtom): card is Unit => {
  return 'bp' in card
}

export { isUnit }
