declare module 'react-dom' {
  export function createPortal(
    children: React.ReactNode,
    container: Element | DocumentFragment,
    key?: null | string
  ): React.ReactPortal;
  
  export function flushSync<R>(fn: () => R): R;
  export function unstable_batchedUpdates<A, R>(callback: (a: A) => R, a: A): R;
  export function unstable_batchedUpdates<R>(callback: () => R): R;
}
