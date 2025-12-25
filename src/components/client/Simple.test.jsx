import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

const Simple = () => <div>Hello World</div>;

describe("Simple Component", () => {
  it("renders hello world", () => {
    render(<Simple />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
