import { Unit } from "./src/package/core/class/card/Unit";
import { Player } from "./src/package/core/class/Player";
import { Core } from "./src/package/core/core";

console.log("Hello via Bun!");

const core = new Core()

const deck = ['0', '1', '2', '3'].map(catalogId => new Unit(catalogId))
const player = new Player(deck);
core.addPlayer(player)

core.start();