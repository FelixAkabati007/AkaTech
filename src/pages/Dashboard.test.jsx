import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Dashboard } from "./Dashboard";

// Mock Layouts
vi.mock("../components/admin/AdminLayout", () => ({
  AdminLayout: () => <div>Admin Console</div>,
}));

vi.mock("../components/client/ClientLayout", () => ({
  ClientLayout: () => <div>Client Portal</div>,
}));

describe("Dashboard Component", () => {
  const mockUser = {
    name: "Test User",
    email: "test@example.com",
  };
  const mockAdminUser = {
    name: "Admin User",
    email: "admin@akatech.com",
  };
  const mockAdminUserByFlag = {
    name: "John Doe",
    email: "JohnDoe@gmail.com",
    isAdmin: true,
  };
  const mockRegularUser = {
    name: "John Doe",
    email: "JohnDoe@gmail.com",
    isAdmin: false,
  };
  const mockOnLogout = vi.fn();

  it("renders Client Portal for non-admin user", () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    expect(screen.getByText("Client Portal")).toBeInTheDocument();
  });

  it("renders Admin Console for admin user (email check)", () => {
    render(<Dashboard user={mockAdminUser} onLogout={mockOnLogout} />);
    expect(screen.getByText("Admin Console")).toBeInTheDocument();
  });

  it("renders Admin Console for user with isAdmin flag", () => {
    render(<Dashboard user={mockAdminUserByFlag} onLogout={mockOnLogout} />);
    expect(screen.getByText("Admin Console")).toBeInTheDocument();
  });

  it("renders Client Portal for regular user (explicit false flag)", () => {
    render(<Dashboard user={mockRegularUser} onLogout={mockOnLogout} />);
    expect(screen.getByText("Client Portal")).toBeInTheDocument();
  });
});
