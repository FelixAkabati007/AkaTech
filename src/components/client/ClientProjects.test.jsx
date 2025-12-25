import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientProjects } from "./ClientProjects";

// Mock Icons to avoid rendering issues
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Search: () => <div data-testid="icon-search" />,
    Activity: () => <div data-testid="icon-activity" />,
    Clock: () => <div data-testid="icon-clock" />,
    FileText: () => <div data-testid="icon-file-text" />,
    CheckCircle: () => <div data-testid="icon-check-circle" />,
    Code: () => <div data-testid="icon-code" />,
    MessageSquare: () => <div data-testid="icon-message-square" />,
    Upload: () => <div data-testid="icon-upload" />,
    Download: () => <div data-testid="icon-download" />,
    X: () => <div data-testid="icon-x" />,
    Folder: () => <div data-testid="icon-folder" />,
  },
}));

describe("ClientProjects", () => {
  const mockUser = { id: 1, name: "Test Client", email: "test@example.com" };
  const mockApiProjects = [
    {
      id: 1,
      plan: "Alpha",
      notes: "Description Alpha",
      status: "in-progress",
      timestamp: "2023-01-01T00:00:00Z",
    },
    {
      id: 2,
      plan: "Beta",
      notes: "Description Beta",
      status: "completed",
      timestamp: "2023-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn((url) => {
      if (url.includes("/api/client/projects")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiProjects),
        });
      }
      if (url.includes("/api/tickets")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });
    // Mock window.alert
    global.alert = vi.fn();
  });

  it("renders the project list", async () => {
    render(<ClientProjects user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText("My Projects")).toBeInTheDocument();
      // "Alpha Project" because of component logic: `${p.plan} Project`
      expect(screen.getByText(/Alpha Project/i)).toBeInTheDocument();
      expect(screen.getByText(/Beta Project/i)).toBeInTheDocument();
    });

    // Check for empty state
    expect(screen.getByText("No Project Selected")).toBeInTheDocument();
  });

  it("filters projects based on search query", async () => {
    render(<ClientProjects user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText(/Alpha Project/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search projects...");
    fireEvent.change(searchInput, { target: { value: "Alpha" } });

    expect(screen.getByText(/Alpha Project/i)).toBeInTheDocument();
    expect(screen.queryByText(/Beta Project/i)).not.toBeInTheDocument();
  });

  it("selects a project and shows details", async () => {
    render(<ClientProjects user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText(/Alpha Project/i)).toBeInTheDocument();
    });

    // Click on Project Alpha
    fireEvent.click(screen.getByText(/Alpha Project/i));

    // Check if details are shown (Timeline, Deliverables headers)
    await waitFor(() => {
      expect(screen.getByText("Timeline")).toBeInTheDocument();
      expect(screen.getByText("Deliverables")).toBeInTheDocument();
      expect(screen.getByText("Request Update")).toBeInTheDocument();
    });
  });

  it("opens request update modal and sends request", async () => {
    render(<ClientProjects user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText(/Alpha Project/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Alpha Project/i));

    // Click Request Update
    await waitFor(() => {
      fireEvent.click(screen.getByText("Request Update"));
    });

    // Check if modal opens
    expect(screen.getByText("Request Project Update")).toBeInTheDocument();

    // Fill form
    const messageInput = screen.getByPlaceholderText(
      "What specific update would you like to request?"
    );
    fireEvent.change(messageInput, { target: { value: "Need status update" } });

    // Submit
    const submitBtn = screen.getByText("Send Request"); // Best guess based on typical modal
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tickets"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("Need status update"),
        })
      );
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "Update request sent successfully!"
      );
    });
  });
});
