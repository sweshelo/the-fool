import { Card } from "./Card";

export class Unit extends Card {
  bp: number;

  constructor(catalogId: string){
    super(catalogId);
    this.bp = 1000;
  }
}