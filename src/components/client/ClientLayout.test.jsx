import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ClientLayout } from "./ClientLayout";

// Mock sub-components to focus on Layout and Icons
vi.mock("./ClientDashboard", () => ({
  ClientDashboard: () => <div>Client Dashboard Component</div>,
}));
vi.mock("./ClientProjects", () => ({
  ClientProjects: () => <div>Client Projects Component</div>,
}));
vi.mock("./ClientBilling", () => ({
  ClientBilling: () => <div>Client Billing Component</div>,
}));
vi.mock("./ClientSupport", () => ({
  ClientSupport: () => <div>Client Support Component</div>,
}));
vi.mock("./ClientProfile", () => ({
  ClientProfile: () => <div>Client Profile Component</div>,
}));

describe("ClientLayout", () => {
  const mockUser = {
    name: "Test User",
    email: "test@example.com",
    role: "client",
    id: "1",
  };
  const mockOnLogout = vi.fn();

  it("renders without crashing and shows dashboard by default", () => {
    render(<ClientLayout user={mockUser} onLogout={mockOnLogout} />);
    expect(screen.getByText("Client Portal")).toBeInTheDocument();
    expect(screen.getByText("Client Dashboard Component")).toBeInTheDocument();
  });

  it("renders navigation items", () => {
    render(<ClientLayout user={mockUser} onLogout={mockOnLogout} />);
    expect(screen.getAllByText("Dashboard")).toHaveLength(2); // Sidebar + Header
    expect(screen.getByText("My Projects")).toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("switches tabs when navigation items are clicked", async () => {
    const user = userEvent.setup();
    render(<ClientLayout user={mockUser} onLogout={mockOnLogout} />);

    await user.click(screen.getByText("My Projects"));
    await waitFor(() => {
      expect(screen.getByText("Client Projects Component")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Billing"));
    await waitFor(() => {
      expect(screen.getByText("Client Billing Component")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Support"));
    await waitFor(() => {
      expect(screen.getByText("Client Support Component")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Profile"));
    await waitFor(() => {
      expect(screen.getByText("Client Profile Component")).toBeInTheDocument();
    });
  });

  it("toggles sidebar", async () => {
    const user = userEvent.setup();
    render(<ClientLayout user={mockUser} onLogout={mockOnLogout} />);

    // Initially sidebar is open
    expect(screen.getByText("Client Portal")).toBeInTheDocument();

    // Find toggle button by aria-label
    const toggleButton = screen.getByRole("button", {
      name: /Toggle Sidebar/i,
    });

    // Click to collapse
    await user.click(toggleButton);

    // "Client Portal" text should disappear or change to "C"
    // The "C" is rendered when sidebar is collapsed.
    await waitFor(() => {
      expect(screen.getByText("C")).toBeInTheDocument();
    });
    // "Client Portal" should not be visible (or not in document if conditional rendering)
    // In ClientLayout.jsx: {isSidebarOpen ? (...) : (...)}
    expect(screen.queryByText("Client Portal")).not.toBeInTheDocument();

    // Click to expand
    await user.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByText("Client Portal")).toBeInTheDocument();
    });
  });
});
