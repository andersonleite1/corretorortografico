const WINDOW_MS = 60_000;
const LIMIT_PER_WINDOW = 60;
const requestTimes = new Map<string, number[]>();
let lastPruneAt = 0;

export function limitRequests(key: string, now = Date.now()) {
  if (now - lastPruneAt > WINDOW_MS) {
    lastPruneAt = now;
    for (const [storedKey, timestamps] of requestTimes) {
      if (!timestamps.some((timestamp) => timestamp > now - WINDOW_MS)) {
        requestTimes.delete(storedKey);
      }
    }
  }

  const active = (requestTimes.get(key) ?? []).filter(
    (timestamp) => timestamp > now - WINDOW_MS,
  );
  const success = active.length < LIMIT_PER_WINDOW;
  if (success) active.push(now);

  // Keep memory bounded if a large number of distinct IPs send requests.
  if (!requestTimes.has(key) && requestTimes.size >= 10_000) {
    const oldestKey = requestTimes.keys().next().value;
    if (oldestKey) requestTimes.delete(oldestKey);
  }

  requestTimes.set(key, active);
  return {
    success,
    reset: (active[0] ?? now) + WINDOW_MS,
  };
}
