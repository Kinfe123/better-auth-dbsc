import { afterEach, vi } from "vitest";

// `Clock` fakes `Date`; no test leaks it into the next.
afterEach(() => {
  vi.useRealTimers();
});
