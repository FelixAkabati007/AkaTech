import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FloatingAssistant } from "./FloatingAssistant";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Icons
vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Bot: (props) => <div data-testid="icon-bot" {...props} />,
  },
}));

// Mock Spline
vi.mock("@splinetool/react-spline", () => ({
  default: ({ onError, ...props }) => (
    <div data-testid="spline-component">
      Spline Mock
      <button onClick={onError} data-testid="trigger-error">
        Trigger Error
      </button>
    </div>
  ),
}));

describe("FloatingAssistant Component", () => {
  it("renders the floating button", () => {
    render(<FloatingAssistant />);
    const button = screen.getByLabelText(
      "Chat with our AI Assistant on WhatsApp"
    );
    expect(button).toBeInTheDocument();
  });

  it("opens WhatsApp on click", () => {
    // Mock window.open
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});

    render(<FloatingAssistant />);
    const button = screen.getByLabelText(
      "Chat with our AI Assistant on WhatsApp"
    );
    fireEvent.click(button);

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("https://wa.me/233244027477"),
      "_blank"
    );

    openSpy.mockRestore();
  });

  it("shows tooltip on hover", () => {
    render(<FloatingAssistant />);
    const button = screen.getByLabelText(
      "Chat with our AI Assistant on WhatsApp"
    );

    // Simulate hover
    fireEvent.mouseEnter(button);

    expect(screen.getByText("Chat with us")).toBeInTheDocument();

    // Simulate mouse leave
    fireEvent.mouseLeave(button);

    expect(screen.queryByText("Chat with us")).not.toBeInTheDocument();
  });

  it("shows fallback icon when spline viewer fails", async () => {
    render(<FloatingAssistant />);

    // Verify viewer is present initially
    const viewer = await screen.findByTestId("spline-component");
    expect(viewer).toBeInTheDocument();

    // Trigger error event
    const triggerBtn = screen.getByTestId("trigger-error");
    fireEvent.click(triggerBtn);

    // Check if fallback icon is present
    expect(await screen.findByTestId("icon-bot")).toBeInTheDocument();

    // Verify viewer is removed
    expect(screen.queryByTestId("spline-component")).not.toBeInTheDocument();
  });
});
