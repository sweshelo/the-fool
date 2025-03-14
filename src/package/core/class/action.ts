import type { Atom } from "./card/Atom";

export interface Action {
  type: string
  role: string
  source: Atom
}