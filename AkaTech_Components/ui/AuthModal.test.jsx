import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuthModal } from "./AuthModal";

vi.mock("@components/ui/ToastProvider", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock("@components/ui/Logo", () => ({
  Logo: () => <div data-testid="logo" />,
}));

describe("AuthModal", () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onLogin: vi.fn(),
    onSignup: vi.fn(),
    onGoogleLogin: vi.fn(),
    onGoogleUnavailable: vi.fn(),
    onRequestPasswordReset: vi.fn(),
    onResetPassword: vi.fn(),
  };

  it("shows email fallback when Google auth is unavailable", () => {
    render(<AuthModal {...baseProps} isGoogleAuthAvailable={false} />);

    expect(
      screen.getByText(/Google authentication is unavailable/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("submits email/password signup", async () => {
    const onSignup = vi.fn(() => Promise.resolve());
    render(
      <AuthModal
        {...baseProps}
        onSignup={onSignup}
        isGoogleAuthAvailable={false}
      />
    );

    fireEvent.click(screen.getByText(/Create an account/i));
    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Client User" },
    });
    fireEvent.change(screen.getByPlaceholderText("name@company.com"), {
      target: { value: "client@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm password"), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(onSignup).toHaveBeenCalledWith({
        name: "Client User",
        email: "client@example.com",
        password: "Password1",
      });
    });
  });

  it("submits password reset token and new password", async () => {
    const onResetPassword = vi.fn(() => Promise.resolve());
    render(
      <AuthModal
        {...baseProps}
        initialMode="reset"
        resetToken="reset-token"
        onResetPassword={onResetPassword}
        isGoogleAuthAvailable={false}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm password"), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByText("Update Password"));

    await waitFor(() => {
      expect(onResetPassword).toHaveBeenCalledWith({
        token: "reset-token",
        password: "Password1",
      });
    });
  });
});
