import type { Stack } from '@/package/core/class/stack';

export function helperIsBreakByEffect(stack: Stack): boolean {
  if (stack.type !== 'break')
    throw new Error('isBreakByEffect: 破壊スタックではないスタックを渡されました');
  if (stack.option?.type !== 'break')
    throw new Error('isBreakByEffect: 破壊理由が格納されていないスタックを渡されました');

  const cause = stack.option.cause;
  const effectTable = ['damage', 'effect'];

  return effectTable.includes(cause);
}
