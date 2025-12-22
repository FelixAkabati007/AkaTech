import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminMessages } from "./AdminMessages";
import { mockService } from "@lib/mockData";

// Mock dependencies
vi.mock("@lib/mockData", () => ({
  mockService: {
    getMessages: vi.fn(),
    deleteMessage: vi.fn(),
    markMessageRead: vi.fn(),
  },
}));

vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Search: () => <span>Search Icon</span>,
    Filter: () => <span>Filter Icon</span>,
    Trash: () => <span>Delete Icon</span>,
    Mail: () => <span>Mail Icon</span>,
    MessageSquare: () => <span>Message Icon</span>,
    Check: () => <span>Check Icon</span>,
    Clock: () => <span>Clock Icon</span>,
    ChevronRight: () => <span>ChevronRight Icon</span>,
    X: () => <span>Close Icon</span>,
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("AdminMessages", () => {
  const mockMessages = [
    {
      id: 1,
      name: "Sender Name",
      email: "sender@example.com",
      subject: "Test Subject",
      message: "Test Message Content",
      date: "2023-01-01T12:00:00",
      read: false,
    },
    {
      id: 2,
      name: "Read Sender",
      email: "read@example.com",
      subject: "Read Subject",
      message: "Read Message Content",
      date: "2023-01-02T12:00:00",
      read: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockService.getMessages.mockReturnValue(mockMessages);
    window.confirm = vi.fn(() => true);
  });

  it("renders message list", async () => {
    render(<AdminMessages />);
    await waitFor(() => {
      expect(screen.getByText("Inbox")).toBeInTheDocument();
    });
    expect(screen.getByText("Sender Name")).toBeInTheDocument();
    expect(screen.getByText("Test Subject")).toBeInTheDocument();
  });

  it("filters messages", async () => {
    render(<AdminMessages />);
    await waitFor(() => {
      expect(screen.getByText("Sender Name")).toBeInTheDocument();
    });

    // Default is all
    expect(screen.getByText("Read Sender")).toBeInTheDocument();

    // Filter unread
    const unreadFilterBtn = screen.getByText("Unread");
    fireEvent.click(unreadFilterBtn);

    // Check if filtering logic works
    expect(screen.getByText("Sender Name")).toBeInTheDocument();
    expect(screen.queryByText("Read Sender")).not.toBeInTheDocument();
  });

  it("selects a message", async () => {
    render(<AdminMessages />);
    await waitFor(() => {
      expect(screen.getByText("Test Subject")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Test Subject"));

    await waitFor(() => {
      expect(
        screen.getAllByText("Test Message Content").length
      ).toBeGreaterThan(0);
      expect(screen.getByText("Reply via Email")).toBeInTheDocument();
    });
    expect(mockService.markMessageRead).toHaveBeenCalledWith(1);
  });

  it("deletes a message", async () => {
    render(<AdminMessages />);
    await waitFor(() => {
      // Use getAllByTitle because there are multiple delete buttons
      expect(screen.getAllByTitle("Delete")[0]).toBeInTheDocument();
    });

    // There are multiple delete buttons (one per message in list).
    // The first one corresponds to the first message.
    const deleteBtns = screen.getAllByTitle("Delete");
    fireEvent.click(deleteBtns[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockService.deleteMessage).toHaveBeenCalledWith(1);
  });
});
