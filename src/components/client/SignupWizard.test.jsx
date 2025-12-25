import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignupWizard } from "./SignupWizard";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock Google Login
vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess }) => (
    <button onClick={() => onSuccess({ credential: "mock-google-token" })}>
      Sign in with Google
    </button>
  ),
  useGoogleLogin: () => {},
}));

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Check: () => <span data-testid="icon-check">CheckIcon</span>,
    AlertTriangle: () => <span data-testid="icon-alert">AlertIcon</span>,
    Google: () => <span data-testid="icon-google">GoogleIcon</span>,
  },
}));

// Mock Data
vi.mock("@lib/data", () => ({
  PRICING_PACKAGES: [
    {
      name: "Starter",
      price: 500,
      description: "Basic package",
      features: ["Feature 1", "Feature 2"],
    },
    {
      name: "Pro",
      price: 1000,
      description: "Pro package",
      features: ["Feature 1", "Feature 2", "Feature 3"],
    },
  ],
}));

// Mock Framer Motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("SignupWizard Component", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the package selection step initially", () => {
    const { debug } = render(<SignupWizard />);
    debug(); // Print HTML to console
    expect(screen.getByText("Select Your Package")).toBeInTheDocument();
  });

  it("navigates to email verification after selecting a package", () => {
    render(<SignupWizard />);
    const packageCard = screen.getByText("Starter").closest("div");
    fireEvent.click(packageCard);

    expect(screen.getByText("Verify Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("handles email input and sending verification code", async () => {
    // Mock successful send response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Verification code sent" }),
    });

    render(<SignupWizard initialPlan={{ name: "Starter", price: 500 }} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const sendButton = screen.getByText("Send Code");
    fireEvent.click(sendButton);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/signup/verify-email"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "test@example.com" }),
      })
    );

    // Should show verification code input
    await waitFor(() => {
      expect(screen.getByPlaceholderText("000000")).toBeInTheDocument();
    });
  });

  it("handles verification code validation success", async () => {
    // 1. Send Code Mock
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Verification code sent" }),
    });

    // 2. Validate Code Mock
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: "Email verified successfully",
        email: "test@example.com",
      }),
    });

    // 3. Progress Check Mock (optional, can fail gracefully)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<SignupWizard initialPlan={{ name: "Starter", price: 500 }} />);

    // Enter email and send
    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByText("Send Code"));

    await waitFor(() => screen.getByPlaceholderText("000000"));

    // Enter code
    const codeInput = screen.getByPlaceholderText("000000");
    fireEvent.change(codeInput, { target: { value: "123456" } });

    const verifyButton = screen.getByText("Verify");
    fireEvent.click(verifyButton);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/signup/validate-code"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", code: "123456" }),
      })
    );

    await waitFor(() => {
      expect(screen.getByText("Email Verified!")).toBeInTheDocument();
    });
  });

  it("handles Google Sign-In verification", async () => {
    // Mock Google verify API call
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: "Verified",
        email: "google@example.com",
        method: "google",
      }),
    });

    // Mock Progress Check
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<SignupWizard initialPlan={{ name: "Starter", price: 500 }} />);

    const googleBtn = screen.getByText("Sign in with Google");
    fireEvent.click(googleBtn);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/signup/verify-google"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "mock-google-token" }),
      })
    );

    await waitFor(() => {
      expect(screen.getByText("Email Verified!")).toBeInTheDocument();
    });
  });

  it("shows error on invalid email format", async () => {
    render(<SignupWizard initialPlan={{ name: "Starter", price: 500 }} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(screen.getByText("Send Code"));

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address.")
      ).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
