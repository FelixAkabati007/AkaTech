import "@testing-library/jest-dom/vitest";
import * as React from "react";
globalThis.React = React;
import { vi } from "vitest";
vi.mock("@components/ui/SyncStatusProvider", () => {
  return {
    useSyncStatus: () => ({ socket: null, status: "offline" }),
  };
});
