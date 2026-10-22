import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  FloatingAssistant,
  isSplineShaderUnrollWarning,
} from "./FloatingAssistant.jsx";
vi.mock("@components/ui/SyncStatusProvider", () => ({
  useSyncStatus: () => ({ socket: null, status: "offline" }),
}));

describe("FloatingAssistant offline handling", () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, "onLine", {
      value: false,
      configurable: true,
    });
  });

  it("renders icon fallback when offline", () => {
    const { container } = render(<FloatingAssistant />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("only suppresses the known Spline shader unroll warning", () => {
    expect(
      isSplineShaderUnrollWarning([
        "THREE.WebGLProgram: Program Info Log: (793,3-49): warning X3557: loop only executes for 1 iteration(s), forcing loop to unroll",
      ])
    ).toBe(true);

    expect(
      isSplineShaderUnrollWarning([
        "THREE.WebGLProgram: Program Info Log: unexpected shader compile error",
      ])
    ).toBe(false);
  });
});
