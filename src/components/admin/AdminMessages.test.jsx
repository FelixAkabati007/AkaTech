import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminMessages } from "./AdminMessages";
import { io } from "socket.io-client";

// Mock dependencies
const { mockSocket } = vi.hoisted(() => {
  return {
    mockSocket: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  };
});

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocket),
}));

vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Search: () => <span>Search Icon</span>,
    X: () => <span>X Icon</span>,
    Download: () => <span>Download Icon</span>,
  },
}));
vi.mock("@components/ui/ToastProvider", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

// Mock fetch
global.fetch = vi.fn();

describe("AdminMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup fetch mock for login and messages
    global.fetch.mockImplementation((url) => {
      if (url.includes("/api/login")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: "fake-token" }),
        });
      }
      if (url.includes("/api/messages") && !url.includes("PATCH")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: "1",
              name: "Test User",
              email: "test@example.com",
              subject: "Test Subject",
              content: "Test Message",
              timestamp: new Date().toISOString(),
              status: "unread",
            },
          ],
        });
      }
      if (url.includes("/api/messages") && url.includes("PATCH")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: "1",
            name: "Test User",
            email: "test@example.com",
            subject: "Test Subject",
            content: "Test Message",
            timestamp: new Date().toISOString(),
            status: "read",
          }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });
  });

  it("renders and fetches messages", async () => {
    render(<AdminMessages />);

    expect(screen.getByText("Loading messages...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("Test Subject")).toBeInTheDocument();
    });
  });

  it("handles real-time new messages", async () => {
    render(<AdminMessages />);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    // Simulate socket event
    const newMsg = {
      id: "2",
      name: "New User",
      email: "new@example.com",
      subject: "New Subject",
      content: "New Message",
      timestamp: new Date().toISOString(),
      status: "unread",
    };

    const socketCallback = mockSocket.on.mock.calls.find(
      (call) => call[0] === "new_message"
    )[1];
    socketCallback(newMsg);

    await waitFor(() => {
      expect(screen.getByText("New User")).toBeInTheDocument();
    });
  });

  it("opens message details and updates status", async () => {
    render(<AdminMessages />);

    await waitFor(() => {
      expect(screen.getByText("View")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("View"));

    expect(screen.getByText("Message Details")).toBeInTheDocument();
    expect(screen.getByText("Test Message")).toBeInTheDocument();

    const markReadBtn = screen.getByText("Mark as Read");
    fireEvent.click(markReadBtn);

    await waitFor(() => {
      // Should have called fetch with PATCH
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/messages/1"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "read" }),
        })
      );
    });
  });
});
