import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConnectionStatus } from "./ConnectionStatus";

describe("ConnectionStatus Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Default online
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
    // Mock fetch to prevent actual network calls and errors
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders online status correctly by default", () => {
    render(<ConnectionStatus />);

    const indicator = screen.getByTestId("connection-status-indicator");
    expect(indicator).toHaveAttribute("aria-label", "Application online");
    expect(indicator).toHaveStyle({ backgroundColor: "#4CAF50" });
  });

  it("renders offline status correctly", () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });
    render(<ConnectionStatus />);

    const indicator = screen.getByTestId("connection-status-indicator");
    expect(indicator).toHaveAttribute("aria-label", "Application offline");
    expect(indicator).toHaveStyle({ backgroundColor: "#F44336" });
  });

  it("updates status on window online/offline events", () => {
    render(<ConnectionStatus />);

    const indicator = screen.getByTestId("connection-status-indicator");
    expect(indicator).toHaveAttribute("aria-label", "Application online");

    // Simulate offline
    act(() => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });
      window.dispatchEvent(new Event("offline"));
    });
    expect(indicator).toHaveAttribute("aria-label", "Application offline");
    expect(indicator).toHaveStyle({ backgroundColor: "#F44336" });

    // Simulate online
    act(() => {
      Object.defineProperty(navigator, "onLine", {
        value: true,
        configurable: true,
      });
      window.dispatchEvent(new Event("online"));
    });
    expect(indicator).toHaveAttribute("aria-label", "Application online");
    expect(indicator).toHaveStyle({ backgroundColor: "#4CAF50" });
  });

  it("shows tooltip on hover", () => {
    render(<ConnectionStatus />);

    const container = screen.getByTestId("connection-status-container");
    fireEvent.mouseEnter(container);

    expect(screen.getByText("Online")).toBeInTheDocument();

    fireEvent.mouseLeave(container);
    expect(screen.queryByText("Online")).not.toBeInTheDocument();
  });

  it("performs heartbeat check and updates status", async () => {
    // Mock fetch sequence:
    // 1. Initial check on mount: Fails (so it stays offline)
    // 2. Interval check: Succeeds (so it recovers)
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce({ ok: true });

    global.fetch = mockFetch;
    window.fetch = mockFetch;

    // Start offline
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });

    await act(async () => {
      render(<ConnectionStatus />);
    });

    const indicator = screen.getByTestId("connection-status-indicator");
    // Should be offline initially
    expect(indicator).toHaveStyle({ backgroundColor: "#F44336" });

    // Advance timer to trigger interval
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Should have called fetch twice (initial + interval)
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // Should be online now
    expect(indicator).toHaveStyle({ backgroundColor: "#4CAF50" });
  });

  it("handles failed heartbeat check", async () => {
    // Mock fetch sequence:
    // 1. Initial check on mount: Succeeds (stays online)
    // 2. Interval check: Fails (goes offline)
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValueOnce(new Error("Network error"));

    global.fetch = mockFetch;
    window.fetch = mockFetch;

    // Start online
    await act(async () => {
      render(<ConnectionStatus />);
    });
    const indicator = screen.getByTestId("connection-status-indicator");

    // Should be online initially
    expect(indicator).toHaveStyle({ backgroundColor: "#4CAF50" });

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Should become offline
    expect(indicator).toHaveStyle({ backgroundColor: "#F44336" });
  });
});
