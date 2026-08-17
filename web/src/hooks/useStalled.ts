import { useEffect, useState } from "react";

/**
 * Flips to true if `ready` stays false past `timeoutMs`. A plain client-side
 * backstop independent of the query layer's own retry/backoff. Resets to
 * false once `ready` becomes true.
 */
export function useStalled(ready: boolean, timeoutMs = 8_000) {
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    if (ready) {
      setStalled(false);
      return;
    }
    const timer = window.setTimeout(() => setStalled(true), timeoutMs);
    return () => window.clearTimeout(timer);
  }, [ready, timeoutMs]);

  return stalled;
}
