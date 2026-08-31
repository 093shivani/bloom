import { useCallback, useRef, useSyncExternalStore } from 'react'
import { liveQuery } from 'dexie'

const LOADING = Symbol('loading')

/**
 * StrictMode-safe alternative to dexie-react-hooks' useLiveQuery, built on
 * useSyncExternalStore (which React guarantees to handle double-invoked
 * subscribe/unsubscribe correctly in development).
 */
export function useLiveQuery<T>(querier: () => Promise<T> | T, deps: unknown[], defaultValue: T): T {
  const stateRef = useRef<T | typeof LOADING>(LOADING)

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      stateRef.current = LOADING
      const subscription = liveQuery(querier).subscribe({
        next: (value) => {
          stateRef.current = value
          onStoreChange()
        },
        error: (err) => {
          console.error('useLiveQuery error:', err)
        },
      })
      return () => subscription.unsubscribe()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  )

  const getSnapshot = useCallback(() => (stateRef.current === LOADING ? defaultValue : stateRef.current), [defaultValue])

  return useSyncExternalStore(subscribe, getSnapshot)
}
