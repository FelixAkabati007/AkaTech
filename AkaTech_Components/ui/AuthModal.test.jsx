import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuthModal } from "./AuthModal";

// Mock dependencies
vi.mock("./Icons", () => ({
  Icons: {
    X: () => <span data-testid="icon-x">X</span>,
    Google: () => <span data-testid="icon-google">Google</span>,
  },
}));

vi.mock("./Logo", () => ({
  Logo: () => <span data-testid="logo">Logo</span>,
}));

vi.mock("./ToastProvider", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

describe("AuthModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOnLogin = vi.fn();
  const mockOnSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when isOpen is true", () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <AuthModal
        isOpen={false}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );
    expect(screen.queryByText("Welcome Back")).not.toBeInTheDocument();
  });

  it("closes when clicking on the backdrop", () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );
    
    // The backdrop is the outer div with role="dialog"
    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("closes when clicking on empty space inside the modal (non-interactive element)", () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );
    
    // Click on the heading
    const heading = screen.getByText("Welcome Back");
    fireEvent.click(heading);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("does NOT close when clicking on an input", () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );
    
    const input = screen.getByPlaceholderText("name@company.com");
    fireEvent.click(input);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("does NOT close when clicking on a button", () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );
    
    const button = screen.getByText("Sign In");
    fireEvent.click(button);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("does NOT close when clicking on a label", () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );
    
    const label = screen.getByText("Email Address");
    fireEvent.click(label);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("closes when pressing Escape key", () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );
    
    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
