export function helperShuffle<T>(targets: T[]): T[] {
  const out: (T | undefined)[] = Array.from(targets);
  for (let i = out.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[r];
    out[r] = tmp;
  }

  return out.filter(e => e !== undefined);
}
