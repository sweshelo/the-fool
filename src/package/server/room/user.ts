import type { Player } from "../../core/class/Player";

export class User {
  id = crypto.randomUUID();
  player: Player | undefined;
}