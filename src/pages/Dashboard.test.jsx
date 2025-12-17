import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Dashboard } from "./Dashboard";

// Mock useToast
vi.mock("@components/ui/ToastProvider", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

// Mock Modal to simplify testing
vi.mock("@components/ui/Modal", () => ({
  Modal: ({ isOpen, title, children }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <h1>{title}</h1>
        {children}
      </div>
    ) : null,
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

  it("renders Quick Actions with correct labels", () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    expect(screen.getByText("Create New Invoice")).toBeInTheDocument();
    expect(screen.getByText("Update Profile Settings")).toBeInTheDocument();
    expect(screen.getByText("Contact Support")).toBeInTheDocument();
  });

  it("renders Quick Actions descriptions", () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    expect(screen.getByText("Generate and send invoices")).toBeInTheDocument();
    expect(screen.getByText("Manage account details")).toBeInTheDocument();
    expect(screen.getByText("Get help with your project")).toBeInTheDocument();
  });

  it("opens Create Invoice modal when button is clicked", () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    const button = screen.getByText("Create New Invoice").closest("button");
    fireEvent.click(button);
    expect(
      screen.getByRole("dialog", { name: "Create New Invoice" })
    ).toBeInTheDocument();
  });

  it("opens Profile Settings modal when button is clicked", () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    const button = screen
      .getByText("Update Profile Settings")
      .closest("button");
    fireEvent.click(button);
    expect(
      screen.getByRole("dialog", { name: "Profile Settings" })
    ).toBeInTheDocument();
  });

  it("opens Contact Support modal when button is clicked", () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />);
    const button = screen.getByText("Contact Support").closest("button");
    fireEvent.click(button);
    expect(
      screen.getByRole("dialog", { name: "Contact Support" })
    ).toBeInTheDocument();
  });
});
