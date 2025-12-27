import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AdinkraBackground from "./AdinkraBackground";

describe("AdinkraBackground", () => {
  it("renders symbols based on window size", () => {
    // Mock window size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 1000,
    });

    const { container } = render(<AdinkraBackground />);

    // 1,000,000 / 50,000 = 20 symbols expected (approx)
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    expect(svgs.length).toBeLessThan(100); // Sanity check
  });
});
