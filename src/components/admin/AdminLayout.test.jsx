import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AdminLayout } from "./AdminLayout";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick, ...props }) => (
      <div className={className} onClick={onClick} {...props}>
        {children}
      </div>
    ),
    aside: ({ children, className, ...props }) => (
      <aside className={className} {...props}>
        {children}
      </aside>
    ),
    span: ({ children, className, ...props }) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    LayoutDashboard: () => <div data-testid="icon-dashboard" />,
    Users: () => <div data-testid="icon-users" />,
    Briefcase: () => <div data-testid="icon-projects" />,
    CreditCard: () => <div data-testid="icon-billing" />,
    LifeBuoy: () => <div data-testid="icon-support" />,
    Settings: () => <div data-testid="icon-settings" />,
    LogOut: () => <div data-testid="icon-logout" />,
    ChevronLeft: () => <div data-testid="icon-chevron-left" />,
    ChevronRight: () => <div data-testid="icon-chevron-right" />,
    User: () => <div data-testid="icon-user" />,
    Menu: () => <div data-testid="icon-menu">Menu</div>, // Changed to div
  },
}));

// Mock Logo
vi.mock("@components/ui/Logo", () => ({
  Logo: () => <div data-testid="logo" />,
}));

// Mock child components to simplify testing
vi.mock("./AdminDashboard", () => ({
  AdminDashboard: () => (
    <div data-testid="content-dashboard">Dashboard Content</div>
  ),
}));
vi.mock("./AdminClients", () => ({
  AdminClients: () => <div data-testid="content-clients">Clients Content</div>,
}));
vi.mock("./AdminProjects", () => ({
  AdminProjects: () => <div>Projects Content</div>,
}));
vi.mock("./AdminBilling", () => ({
  AdminBilling: () => <div>Billing Content</div>,
}));
vi.mock("./AdminSupport", () => ({
  AdminSupport: () => <div>Support Content</div>,
}));
vi.mock("./AdminSettings", () => ({
  AdminSettings: () => <div>Settings Content</div>,
}));

describe("AdminLayout", () => {
  const mockUser = {
    name: "Admin User",
    role: "Administrator",
    avatar: "AU",
  };
  const mockOnLogout = vi.fn();

  it("renders the layout with sidebar and main content", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);

    expect(screen.getByText("AkaTech Admin")).toBeDefined();
    expect(screen.getByTestId("content-dashboard")).toBeDefined(); // Unique ID
    // User name might be in the button now, let's look for it
    expect(screen.getByText("Admin User")).toBeDefined();
  });

  it("renders the mobile menu toggle button", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);

    const menuButton = screen.getByTestId("icon-menu").closest("button");
    expect(menuButton).toBeDefined();
    expect(menuButton.className).toContain("md:hidden");
  });

  it("toggles mobile sidebar when menu button is clicked", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);

    // Click menu button
    const menuButton = screen.getByTestId("icon-menu").closest("button");
    fireEvent.click(menuButton);

    // Now sidebar should have fixed class
    const aside = screen.getByText("AkaTech Admin").closest("aside");
    expect(aside.className).toContain("fixed");
  });

  it("opens profile dropdown when user profile is clicked", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);

    // Click user profile button (find by user name)
    const profileButton = screen.getByText("Admin User").closest("button");
    fireEvent.click(profileButton);

    // Check if dropdown items are visible
    expect(screen.getByText("Profile")).toBeDefined();

    // Use getAllByText for "Settings" because it appears in both Sidebar and Dropdown
    const settingsItems = screen.getAllByText("Settings");
    expect(settingsItems.length).toBeGreaterThan(0);

    // Use getAllByText for "Sign Out" because it appears in both Sidebar and Dropdown
    const signOutItems = screen.getAllByText("Sign Out");
    expect(signOutItems.length).toBeGreaterThan(0);
  });

  it("navigates to different tabs", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);

    const clientsButton = screen.getByText("Clients").closest("button");
    fireEvent.click(clientsButton);

    expect(screen.getByText("Clients Content")).toBeDefined();
  });

  it("calls onLogout when sign out is clicked", () => {
    render(<AdminLayout user={mockUser} onLogout={mockOnLogout} />);

    const logoutButton = screen.getByText("Sign Out").closest("button");
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalled();
  });
});
