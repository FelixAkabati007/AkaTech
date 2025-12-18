import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

// Mock the child components to avoid testing their internal logic and speed up the test
vi.mock("@components/sections/Hero", () => ({
  Hero: () => <div data-testid="hero">Hero Section</div>,
}));
vi.mock("@components/sections/Services", () => ({
  Services: () => <div data-testid="services">Services Section</div>,
}));
vi.mock("@components/sections/Recommendations", () => ({
  Recommendations: () => (
    <div data-testid="recommendations">Recommendations Section</div>
  ),
}));
vi.mock("@components/sections/Pricing", () => ({
  Pricing: () => <div data-testid="pricing">Pricing Section</div>,
}));
vi.mock("@components/sections/Contact", () => ({
  Contact: () => <div data-testid="contact">Contact Section</div>,
}));
vi.mock("@components/layout/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));
vi.mock("@components/layout/Footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe("App Component", () => {
  it("renders landing page by default", async () => {
    render(<App />);

    // Check for immediate elements
    expect(screen.getByTestId("navbar")).toBeInTheDocument();

    // Check for background decoration
    const bgImage = screen.getByAltText("");
    expect(bgImage).toBeInTheDocument();
    expect(bgImage).toHaveAttribute("src", "/background-accent.jpg");
    expect(bgImage).toHaveClass(
      "fixed",
      "bottom-0",
      "left-0",
      "pointer-events-none"
    );

    // Check for landing page sections
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("services")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
