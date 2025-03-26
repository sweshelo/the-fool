import type { IAtom } from "@/submodule/suit/types/card";

export class Atom implements IAtom {
  id: string = crypto.randomUUID();
}