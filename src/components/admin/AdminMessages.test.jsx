import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AdminMessages } from "./AdminMessages";
import React from "react";

// Mock dependencies
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Search: () => <div data-testid="icon-search" />,
    Plus: () => <div data-testid="icon-plus" />,
    Trash2: () => <div data-testid="icon-trash" />,
    Check: () => <div data-testid="icon-check" />,
    Refresh: () => <div data-testid="icon-refresh" />,
    Filter: () => <div data-testid="icon-filter" />,
    Mail: () => <div data-testid="icon-mail" />,
    Send: () => <div data-testid="icon-send" />,
    X: () => <div data-testid="icon-x" />,
    Edit: () => <div data-testid="icon-edit" />,
    AlertCircle: () => <div data-testid="icon-alert-circle" />,
    MessageSquare: () => <div data-testid="icon-message-square" />,
  },
}));

vi.mock("@lib/localData", () => ({
  localDataService: {
    getMessages: vi.fn(() => []),
    getUsers: vi.fn(() => []),
    saveMessage: vi.fn(),
  },
}));

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

describe("AdminMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders messages with valid and invalid timestamps without crashing", async () => {
    const mockMessages = [
      {
        id: "1",
        name: "Valid User",
        email: "valid@example.com",
        subject: "Valid Date",
        content: "This has a valid date",
        timestamp: "2023-01-01T12:00:00Z",
        status: "unread",
      },
      {
        id: "2",
        name: "Invalid User",
        email: "invalid@example.com",
        subject: "Invalid Date",
        content: "This has an invalid date",
        timestamp: "invalid-date-string",
        status: "read",
      },
      {
        id: "3",
        name: "Null User",
        email: "null@example.com",
        subject: "Null Date",
        content: "This has a null date",
        timestamp: null,
        status: "read",
      },
    ];

    // Mock successful fetch for messages and clients
    global.fetch.mockImplementation((url) => {
      if (url.includes("/messages")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMessages),
        });
      }
      if (url.includes("/users")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({ ok: false });
    });

    // Set token to trigger fetch
    localStorage.setItem("token", "fake-token");

    await act(async () => {
      render(<AdminMessages />);
    });

    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText("Valid User")).toBeInTheDocument();
      expect(screen.getByText("Invalid User")).toBeInTheDocument();
      expect(screen.getByText("Null User")).toBeInTheDocument();
    });

    // Check if dates are rendered correctly (or empty for invalid)
    expect(screen.getByText("Jan 1")).toBeInTheDocument(); // Valid date
    // For invalid dates, we expect empty string or nothing specific to date
    // We can check that it didn't crash.
  });
});
