import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Icons } from "@components/ui/Icons";

vi.mock("@components/ui/Icons", () => ({
  Icons: {
    Check: () => <span>MockedCheck</span>
  }
}));

const AliasComp = () => <div><Icons.Check /></div>;

describe("Alias Component", () => {
  it("renders mocked icon", () => {
    render(<AliasComp />);
    expect(screen.getByText("MockedCheck")).toBeInTheDocument();
  });
});
