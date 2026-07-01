// Apple's iTunes Search/Lookup API starts returning 403s once a client sends
// requests too fast — capping *concurrency* alone isn't enough, since a queue
// that immediately refills each freed slot still sustains a high request
// rate. Background enrichment (chart rails, decorative art) can blow past
// that budget in a couple seconds on its own, starving real user searches.
//
// "high" priority (user-driven: search, opening a detail page, buy/play)
// gets its own concurrency pool and is dispatched immediately. "low"
// priority (background chart/genre prefetching, decorative art) is paced
// with a minimum gap between dispatches so it trickles in over several
// seconds instead of bursting, regardless of how many callers are queued.

type Priority = "high" | "low";

const MAX_CONCURRENT_HIGH = 6;
const MAX_CONCURRENT_LOW = 2;
const LOW_PRIORITY_MIN_GAP_MS = 200;

let activeHigh = 0;
let activeLow = 0;
let lastLowDispatch = 0;
const highQueue: Array<() => void> = [];
const lowQueue: Array<() => void> = [];
let lowPumpTimer: ReturnType<typeof setTimeout> | null = null;

function pump() {
  while (activeHigh < MAX_CONCURRENT_HIGH && highQueue.length) {
    activeHigh++;
    highQueue.shift()!();
  }

  if (!lowQueue.length || lowPumpTimer) return;

  const wait = lastLowDispatch + LOW_PRIORITY_MIN_GAP_MS - Date.now();
  if (activeLow < MAX_CONCURRENT_LOW && wait <= 0) {
    activeLow++;
    lastLowDispatch = Date.now();
    lowQueue.shift()!();
    if (lowQueue.length) scheduleLowPump(LOW_PRIORITY_MIN_GAP_MS);
  } else {
    scheduleLowPump(Math.max(wait, 20));
  }
}

function scheduleLowPump(delay: number) {
  lowPumpTimer = setTimeout(() => {
    lowPumpTimer = null;
    pump();
  }, delay);
}

function schedule(priority: Priority): Promise<void> {
  return new Promise((resolve) => {
    (priority === "high" ? highQueue : lowQueue).push(resolve);
    pump();
  });
}

function release(priority: Priority) {
  if (priority === "high") activeHigh--;
  else activeLow--;
  pump();
}

export async function queuedFetch(
  input: string,
  init?: RequestInit & { priority?: Priority }
): Promise<Response> {
  const { priority = "low", ...rest } = init ?? {};
  await schedule(priority);
  try {
    return await fetch(input, rest);
  } finally {
    release(priority);
  }
}
