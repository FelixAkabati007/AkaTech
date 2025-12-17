import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Navbar } from "./Navbar";

// Mock dependencies
vi.mock("../ui/Icons", () => ({
  Icons: {
    Sun: () => <div data-testid="icon-sun">Sun</div>,
    Moon: () => <div data-testid="icon-moon">Moon</div>,
    Monitor: () => <div data-testid="icon-monitor">Monitor</div>,
    Menu: () => <div data-testid="icon-menu">Menu</div>,
    X: () => <div data-testid="icon-x">X</div>,
  },
}));

vi.mock("../ui/Logo", () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

describe("Navbar Component", () => {
  const defaultProps = {
    toggleAuth: vi.fn(),
    isLoggedIn: false,
    user: null,
    mode: "system",
    cycleTheme: vi.fn(),
    onViewChange: vi.fn(),
  };

  it("renders correctly", () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByText("AKATECH")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

  it("displays login button when not logged in", () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText("Client Login")).toBeInTheDocument();
  });

  it("displays user initial when logged in", () => {
    const userProps = {
      ...defaultProps,
      isLoggedIn: true,
      user: { name: "Test User", avatar: "avatar.jpg" },
    };
    render(<Navbar {...userProps} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("calls toggleAuth when login button is clicked", () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByText("Client Login"));
    expect(defaultProps.toggleAuth).toHaveBeenCalled();
  });
});
