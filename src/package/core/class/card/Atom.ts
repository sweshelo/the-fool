import type { IAtom } from '@/submodule/suit/types/game/card';

export class Atom implements IAtom {
  id: string = crypto.randomUUID();
}
