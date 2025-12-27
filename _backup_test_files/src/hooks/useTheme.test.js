import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTheme } from "./useTheme";

describe("useTheme Hook", () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset document class
    document.documentElement.classList.remove("dark");

    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("defaults to system mode", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe("system");
  });

  it("cycles through modes correctly", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.cycleTheme();
    });
    expect(result.current.mode).toBe("light");

    act(() => {
      result.current.cycleTheme();
    });
    expect(result.current.mode).toBe("dark");

    act(() => {
      result.current.cycleTheme();
    });
    expect(result.current.mode).toBe("system");
  });

  it("applies dark class when mode is dark", () => {
    const { result } = renderHook(() => useTheme());

    // Cycle to light
    act(() => {
      result.current.cycleTheme();
    });

    // Cycle to dark
    act(() => {
      result.current.cycleTheme();
    });

    expect(result.current.mode).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class when mode is light", () => {
    const { result } = renderHook(() => useTheme());

    // Cycle to light
    act(() => {
      result.current.cycleTheme();
    });

    expect(result.current.mode).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists theme in localStorage", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.cycleTheme(); // to light
    });

    expect(localStorage.getItem("akatech-theme")).toBe("light");
  });
});
