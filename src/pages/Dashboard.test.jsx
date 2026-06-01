import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dashboard } from "./Dashboard";

vi.mock("../components/admin/AdminLayout", () => ({
  AdminLayout: () => <div>Admins page</div>,
}));

vi.mock("../components/client/ClientLayout", () => ({
  ClientLayout: () => <div>Client page</div>,
}));

describe("Dashboard role routing", () => {
  it("routes explicit admin users to the Admins page", () => {
    render(
      <Dashboard
        user={{ email: "felixakabati007@gmail.com", role: "admin" }}
        onLogout={() => {}}
      />
    );

    expect(screen.getByText("Admins page")).toBeInTheDocument();
  });

  it("routes non-admin users to the client page even when their email contains admin", () => {
    render(
      <Dashboard
        user={{ email: "admin-client@example.com", role: "client" }}
        onLogout={() => {}}
      />
    );

    expect(screen.getByText("Client page")).toBeInTheDocument();
  });
});
