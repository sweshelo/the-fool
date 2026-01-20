export function helperRepeat(times: number, callback: () => unknown) {
  [...Array(Math.max(times, 0))].forEach(callback);
}
