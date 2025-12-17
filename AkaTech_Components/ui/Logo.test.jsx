import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Logo } from "./Logo";

describe("Logo Component", () => {
  it("renders correctly", () => {
    render(<Logo />);
    const logoElement = screen.getByRole("img", { name: /AkaTech Logo/i });
    expect(logoElement).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Logo className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
