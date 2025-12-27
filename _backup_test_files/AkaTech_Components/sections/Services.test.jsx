import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Services } from "./Services";

vi.mock('@lib/data', () => ({
  SERVICES: [
    {
      title: "Service 1",
      desc: "Description 1",
      icon: (props) => <div data-testid="icon-service-1" {...props} />,
    },
    {
      title: "Service 2",
      desc: "Description 2",
      icon: (props) => <div data-testid="icon-service-2" {...props} />,
    },
  ],
}));

describe("Services Component", () => {
  it("renders section title", () => {
    render(<Services />);
    expect(screen.getByText("Our Expertise")).toBeInTheDocument();
  });

  it("renders service items", () => {
    render(<Services />);
    expect(screen.getByText("Service 1")).toBeInTheDocument();
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Service 2")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });

  it("renders service icons", () => {
    render(<Services />);
    expect(screen.getByTestId("icon-service-1")).toBeInTheDocument();
    expect(screen.getByTestId("icon-service-2")).toBeInTheDocument();
  });
});
