import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Pricing } from "./Pricing";

// Mock data
vi.mock("@lib/data", () => ({
  PRICING_PACKAGES: [
    {
      name: "Basic Plan",
      price: "1000",
      description: "Basic description",
      features: ["Feature 1", "Feature 2"],
      recommended: false,
    },
    {
      name: "Pro Plan",
      price: "2000",
      description: "Pro description",
      features: ["Feature A", "Feature B"],
      recommended: true,
    },
  ],
}));

vi.mock("../ui/Icons", () => ({
  Icons: {
    Check: () => <div data-testid="icon-check">Check</div>,
  },
}));

describe("Pricing Component", () => {
  const onSelectPlan = vi.fn();

  it("renders all pricing packages", () => {
    render(<Pricing onSelectPlan={onSelectPlan} />);
    expect(screen.getByText("Basic Plan")).toBeInTheDocument();
    expect(screen.getByText("Pro Plan")).toBeInTheDocument();
  });

  it("displays correct prices", () => {
    render(<Pricing onSelectPlan={onSelectPlan} />);
    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("2000")).toBeInTheDocument();
  });

  it("calls onSelectPlan when a plan is selected", () => {
    render(<Pricing onSelectPlan={onSelectPlan} />);
    const selectButtons = screen.getAllByText("Select Plan");
    fireEvent.click(selectButtons[0]);
    expect(onSelectPlan).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Basic Plan" })
    );
  });
});
