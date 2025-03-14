import { Atom } from "./Atom";

export abstract class Card extends Atom {
  catalogId: string

  constructor(catalogId: string){
    super()
    this.catalogId = catalogId
  }
}