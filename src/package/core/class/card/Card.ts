import type { ICard } from "@/submodule/suit/types/card";
import { Atom } from "./Atom";

export abstract class Card extends Atom implements ICard {
  catalogId: string

  constructor(catalogId: string){
    super()
    this.catalogId = catalogId
  }
}