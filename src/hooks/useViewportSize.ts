"use client";

import { useSyncExternalStore } from "react";

/** Stable defaults for SSR / hydration — typical phone width */
const SSR_WIDTH = 390;
const SSR_HEIGHT = 844;

export type ViewportSize = { width: number; height: number };

/** Must be a stable reference — React compares getServerSnapshot by identity */
const SERVER_SNAPSHOT: ViewportSize = {
  width: SSR_WIDTH,
  height: SSR_HEIGHT,
};

let clientSnapshot: ViewportSize = SERVER_SNAPSHOT;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getSnapshot(): ViewportSize {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (
    clientSnapshot.width === width &&
    clientSnapshot.height === height
  ) {
    return clientSnapshot;
  }

  clientSnapshot = { width, height };
  return clientSnapshot;
}

function getServerSnapshot(): ViewportSize {
  return SERVER_SNAPSHOT;
}

/** SSR-safe viewport size for layout math that must match on first paint. */
export function useViewportSize(): ViewportSize {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
